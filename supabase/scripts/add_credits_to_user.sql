-- 给特定用户添加积分的安全 SQL 脚本
-- 使用方式 A（推荐）：在执行前设置参数，无需修改脚本
--   SET app.target_user_email = 'user@example.com';
--   SET app.credits_to_add = '10';
-- 使用方式 B：直接修改下面 DO 块里的默认值

DO $$
DECLARE
    -- 可通过 GUC 参数覆盖，未设置时使用默认值
    target_user_email TEXT := COALESCE(current_setting('app.target_user_email', true), 'your_email@example.com');
    credits_to_add    INTEGER := COALESCE(NULLIF(current_setting('app.credits_to_add', true), '')::int, 10);

    -- 内部变量
    target_customer_id UUID;
    current_credits INTEGER;
    new_credits INTEGER;
    target_user_id UUID;
BEGIN
    -- 0) 必填检查：防止使用默认占位邮箱
    IF target_user_email IS NULL OR target_user_email = '' OR lower(target_user_email) = 'your_email@example.com' THEN
        RAISE EXCEPTION 'Please set app.target_user_email (or edit the script default) to a real email address.';
    END IF;

    -- 1) 通过邮箱查找用户（忽略大小写）
    SELECT au.id INTO target_user_id
    FROM auth.users au
    WHERE lower(au.email) = lower(target_user_email);

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_user_email;
    END IF;

    RAISE NOTICE 'Found user: % (ID: %)', target_user_email, target_user_id;

    -- 2) 查找或创建 customers 记录
    SELECT id, credits INTO target_customer_id, current_credits
    FROM public.customers
    WHERE user_id = target_user_id;

    IF target_customer_id IS NULL THEN
        -- 如果不存在则创建；customers.email 需为小写（有检查约束）
        INSERT INTO public.customers (
            user_id,
            email,
            credits,
            creem_customer_id,
            created_at,
            updated_at,
            metadata
        ) VALUES (
            target_user_id,
            lower(target_user_email),
            credits_to_add,
            'manual_' || target_user_id::text,
            timezone('utc', now()),
            timezone('utc', now()),
            jsonb_build_object(
                'source', 'manual_credit_addition',
                'created_by', 'admin',
                'initial_credits', credits_to_add
            )
        ) RETURNING id, credits INTO target_customer_id, current_credits;

        RAISE NOTICE 'Created new customer record with % credits', credits_to_add;
    ELSE
        -- 若已存在则累加积分
        new_credits := current_credits + credits_to_add;

        UPDATE public.customers
        SET 
            credits = new_credits,
            updated_at = timezone('utc', now()),
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                'last_credit_addition', timezone('utc', now()),
                'last_addition_amount', credits_to_add
            )
        WHERE id = target_customer_id;

        RAISE NOTICE 'Updated customer credits: % + % = %', current_credits, credits_to_add, new_credits;
        current_credits := new_credits;
    END IF;

    -- 3) 记录积分变更历史
    INSERT INTO public.credits_history (
        customer_id,
        amount,
        type,
        description,
        created_at,
        metadata
    ) VALUES (
        target_customer_id,
        credits_to_add,
        'add',
        'Manual credit addition by admin',
        timezone('utc', now()),
        jsonb_build_object(
            'source', 'manual_admin_addition',
            'admin_action', true,
            'target_email', target_user_email,
            'credits_before', GREATEST(COALESCE(current_credits - credits_to_add, 0), 0),
            'credits_after', current_credits,
            'addition_date', timezone('utc', now())
        )
    );

    RAISE NOTICE 'Credit history record created successfully';

    -- 4) 输出最终状态
    RAISE NOTICE '=== FINAL STATUS ===';
    RAISE NOTICE 'User: % (ID: %)', target_user_email, target_user_id;
    RAISE NOTICE 'Customer ID: %', target_customer_id;
    RAISE NOTICE 'Final Credits: %', current_credits;
    RAISE NOTICE 'Credits Added: %', credits_to_add;

END $$;
