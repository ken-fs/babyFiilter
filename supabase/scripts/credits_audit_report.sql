-- 积分核算和审计报表 SQL 脚本
-- 用于追踪所有积分操作，确保核算清晰

-- 使用方式（推荐）：先设置参数，再执行整段脚本
--   SET app.target_user_email = 'user@example.com';

-- ==== 1 & 2. 用户基本信息 + 积分历史详情（时间倒序） ====
WITH params AS (
    SELECT lower(COALESCE(NULLIF(current_setting('app.target_user_email', true), ''), 'your_email@example.com')) AS target_email
),
report_union AS (
    -- 1) 用户当前积分概览
    SELECT 
        '=== USER CREDITS AUDIT REPORT ===' as report_section,
        au.email as col2,
        au.id as user_id,
        c.id as customer_id,
        c.credits as current_credits,
        c.created_at as customer_since,
        c.updated_at as last_updated,
        1 as section_order,
        NULL::timestamptz as order_created_at
    FROM auth.users au
    LEFT JOIN public.customers c ON au.id = c.user_id
    CROSS JOIN params p
    WHERE lower(au.email) = p.target_email

    UNION ALL

    -- 2) 历史流水明细（合并到同一结果集中，按时间倒序）
    SELECT 
        '=== CREDITS HISTORY DETAILS ===' as report_section,
        CONCAT(
            ch.created_at::date, ' | ',
            CASE WHEN ch.type = 'add' THEN '+' ELSE '-' END,
            ch.amount, ' | ',
            ch.description, ' | ',
            COALESCE(ch.metadata->>'source', 'unknown')
        ) as col2,
        NULL::uuid as user_id,
        NULL::uuid as customer_id,
        NULL::integer as current_credits,
        NULL::timestamptz as customer_since,
        NULL::timestamptz as last_updated,
        2 as section_order,
        ch.created_at as order_created_at
    FROM auth.users au
    JOIN public.customers c ON au.id = c.user_id
    JOIN public.credits_history ch ON c.id = ch.customer_id
    CROSS JOIN params p
    WHERE lower(au.email) = p.target_email
)
SELECT report_section,
       col2 as user_email_or_details,
        user_id,
        customer_id,
        current_credits,
        customer_since,
        last_updated
FROM report_union
ORDER BY section_order, order_created_at DESC;

-- ==== 3. 积分流水账汇总（与当前余额校验） ====
WITH params AS (
    SELECT lower(COALESCE(NULLIF(current_setting('app.target_user_email', true), ''), 'your_email@example.com')) AS target_email
),
user_credits_summary AS (
    SELECT 
        au.email,
        c.credits as current_credits,
        -- 总充值
        COALESCE(SUM(CASE WHEN ch.type = 'add' THEN ch.amount ELSE 0 END), 0) as total_credits_added,
        -- 总消耗
        COALESCE(SUM(CASE WHEN ch.type = 'subtract' THEN ch.amount ELSE 0 END), 0) as total_credits_used,
        -- 理论余额（充值为正，消耗为负）
        COALESCE(SUM(CASE WHEN ch.type = 'add' THEN ch.amount ELSE -ch.amount END), 0) as calculated_balance,
        -- 操作次数
        COUNT(CASE WHEN ch.type = 'add' THEN 1 END) as total_additions,
        COUNT(CASE WHEN ch.type = 'subtract' THEN 1 END) as total_subtractions,
        COUNT(*) as total_transactions
    FROM auth.users au
    LEFT JOIN public.customers c ON au.id = c.user_id
    LEFT JOIN public.credits_history ch ON c.id = ch.customer_id
    CROSS JOIN params p
    WHERE lower(au.email) = p.target_email
    GROUP BY au.email, c.credits
)
SELECT 
    '=== CREDITS SUMMARY REPORT ===' as section,
    email as user_email,
    current_credits,
    total_credits_added,
    total_credits_used,
    calculated_balance,
    -- 账务是否平衡
    CASE 
        WHEN current_credits = calculated_balance THEN '✅ BALANCED'
        ELSE '⚠️ UNBALANCED (Diff: ' || (current_credits - calculated_balance) || ')'
    END as balance_status,
    total_additions,
    total_subtractions,
    total_transactions
FROM user_credits_summary;

-- ==== 4. 管理员操作审计 ====
-- 查看所有管理员手动添加的积分记录
SELECT 
    '=== ADMIN ACTIONS AUDIT ===' as section,
    au.email as target_user,
    ch.created_at as action_date,
    ch.amount as credits_added,
    ch.description,
    ch.metadata->>'source' as operation_source,
    CASE 
        WHEN ch.metadata->>'admin_action' = 'true' THEN '👨‍💻 ADMIN'
        ELSE '🤖 SYSTEM'
    END as action_type,
    ch.metadata->>'credits_before' as credits_before,
    ch.metadata->>'credits_after' as credits_after
FROM public.credits_history ch
JOIN public.customers c ON ch.customer_id = c.id
JOIN auth.users au ON c.user_id = au.id
WHERE ch.type = 'add' 
  AND (ch.metadata->>'admin_action' = 'true' OR ch.description ILIKE '%manual%')
ORDER BY ch.created_at DESC;

-- ==== 5. 系统完整性检查 ====
-- 检查是否有孤立的记录或数据不一致
SELECT 
    '=== SYSTEM INTEGRITY CHECK ===' as section,
    COUNT(DISTINCT au.id) as total_users,
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(ch.id) as total_credit_transactions,
    SUM(CASE WHEN au.id IS NULL THEN 1 ELSE 0 END) as orphaned_customers,
    SUM(CASE WHEN c.id IS NULL THEN 1 ELSE 0 END) as orphaned_credit_history
FROM auth.users au
FULL OUTER JOIN public.customers c ON au.id = c.user_id
FULL OUTER JOIN public.credits_history ch ON c.id = ch.customer_id;

