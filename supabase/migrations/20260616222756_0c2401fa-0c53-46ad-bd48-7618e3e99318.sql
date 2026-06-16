ALTER TABLE public.grants ALTER COLUMN "amountRequested" TYPE double precision, ALTER COLUMN "awardAmount" TYPE double precision;
ALTER TABLE public.donors ALTER COLUMN "askAmount" TYPE double precision;
ALTER TABLE public.golf_sponsors ALTER COLUMN "amount" TYPE double precision;
ALTER TABLE public.golf_foursomes ALTER COLUMN "amount" TYPE double precision;
ALTER TABLE public.golf_players ALTER COLUMN "amount" TYPE double precision;
ALTER TABLE public.golf_auction ALTER COLUMN "estimatedValue" TYPE double precision;
ALTER TABLE public.golf_expenses ALTER COLUMN "amount" TYPE double precision;
ALTER TABLE public.board_members
  ALTER COLUMN "giveGoal" TYPE double precision,
  ALTER COLUMN "given" TYPE double precision;
ALTER TABLE public.goals
  ALTER COLUMN "totalRevenueGoal" TYPE double precision,
  ALTER COLUMN "cashGoal" TYPE double precision,
  ALTER COLUMN "inKindGoal" TYPE double precision,
  ALTER COLUMN "totalExpenses" TYPE double precision,
  ALTER COLUMN "boardGivingGoal" TYPE double precision;