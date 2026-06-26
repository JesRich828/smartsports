CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = _user_id
      AND u.email IS NOT NULL
      AND lower(u.email) LIKE '%@sharingexcess.com'
  )
$function$;