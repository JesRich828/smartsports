-- Grants pipeline
CREATE TABLE public.grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "funderName" text NOT NULL DEFAULT '',
  "fundingType" text NOT NULL DEFAULT '',
  "priorityArea" text NOT NULL DEFAULT '',
  "geographicFocus" text NOT NULL DEFAULT '',
  "programFit" text NOT NULL DEFAULT '',
  "amountRequested" numeric NOT NULL DEFAULT 0,
  "likelihood" text NOT NULL DEFAULT 'Medium',
  "deadline" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'Researching',
  "loiDueDate" text NOT NULL DEFAULT '',
  "applicationDueDate" text NOT NULL DEFAULT '',
  "reportDueDate" text NOT NULL DEFAULT '',
  "contactName" text NOT NULL DEFAULT '',
  "contactEmail" text NOT NULL DEFAULT '',
  "relationshipNotes" text NOT NULL DEFAULT '',
  "nextStep" text NOT NULL DEFAULT '',
  "assignedOwner" text NOT NULL DEFAULT '',
  "documentsNeeded" text NOT NULL DEFAULT '',
  "submittedDate" text NOT NULL DEFAULT '',
  "decisionDate" text NOT NULL DEFAULT '',
  "awardAmount" numeric NOT NULL DEFAULT 0,
  "declinedReason" text NOT NULL DEFAULT '',
  "renewalOpportunity" boolean NOT NULL DEFAULT false,
  "notes" text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grants TO authenticated;
GRANT ALL ON public.grants TO service_role;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage grants" ON public.grants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Donors & prospects
CREATE TABLE public.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "organization" text NOT NULL DEFAULT '',
  "type" text NOT NULL DEFAULT '',
  "givingCapacity" text NOT NULL DEFAULT '',
  "interestArea" text NOT NULL DEFAULT '',
  "connection" text NOT NULL DEFAULT '',
  "lastContact" text NOT NULL DEFAULT '',
  "nextStep" text NOT NULL DEFAULT '',
  "askAmount" numeric NOT NULL DEFAULT 0,
  "stage" text NOT NULL DEFAULT '',
  "notes" text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donors TO authenticated;
GRANT ALL ON public.donors TO service_role;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage donors" ON public.donors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Golf sponsors
CREATE TABLE public.golf_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "level" text NOT NULL DEFAULT '',
  "amount" numeric NOT NULL DEFAULT 0,
  "confirmed" boolean NOT NULL DEFAULT false,
  "followUp" text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_sponsors TO authenticated;
GRANT ALL ON public.golf_sponsors TO service_role;
ALTER TABLE public.golf_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage golf_sponsors" ON public.golf_sponsors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Golf foursomes
CREATE TABLE public.golf_foursomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "captain" text NOT NULL DEFAULT '',
  "organization" text NOT NULL DEFAULT '',
  "players" integer NOT NULL DEFAULT 4,
  "amount" numeric NOT NULL DEFAULT 0,
  "paid" boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_foursomes TO authenticated;
GRANT ALL ON public.golf_foursomes TO service_role;
ALTER TABLE public.golf_foursomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage golf_foursomes" ON public.golf_foursomes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Golf individual players
CREATE TABLE public.golf_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "organization" text NOT NULL DEFAULT '',
  "amount" numeric NOT NULL DEFAULT 0,
  "paid" boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_players TO authenticated;
GRANT ALL ON public.golf_players TO service_role;
ALTER TABLE public.golf_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage golf_players" ON public.golf_players FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Golf auction & in-kind items
CREATE TABLE public.golf_auction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "item" text NOT NULL DEFAULT '',
  "donor" text NOT NULL DEFAULT '',
  "estimatedValue" numeric NOT NULL DEFAULT 0,
  "type" text NOT NULL DEFAULT 'Auction',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_auction TO authenticated;
GRANT ALL ON public.golf_auction TO service_role;
ALTER TABLE public.golf_auction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage golf_auction" ON public.golf_auction FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Golf expenses
CREATE TABLE public.golf_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "item" text NOT NULL DEFAULT '',
  "amount" numeric NOT NULL DEFAULT 0,
  "category" text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_expenses TO authenticated;
GRANT ALL ON public.golf_expenses TO service_role;
ALTER TABLE public.golf_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage golf_expenses" ON public.golf_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Board members
CREATE TABLE public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "giveGoal" numeric NOT NULL DEFAULT 0,
  "given" numeric NOT NULL DEFAULT 0,
  "introductions" integer NOT NULL DEFAULT 0,
  "meetingsScheduled" integer NOT NULL DEFAULT 0,
  "prospectsAssigned" integer NOT NULL DEFAULT 0,
  "sponsorOutreach" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_members TO authenticated;
GRANT ALL ON public.board_members TO service_role;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage board_members" ON public.board_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Organization-wide FY26 goals (single row)
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "totalRevenueGoal" numeric NOT NULL DEFAULT 0,
  "cashGoal" numeric NOT NULL DEFAULT 0,
  "inKindGoal" numeric NOT NULL DEFAULT 0,
  "totalExpenses" numeric NOT NULL DEFAULT 0,
  "boardGivingGoal" numeric NOT NULL DEFAULT 0,
  "channels" jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage goals" ON public.goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed goals
INSERT INTO public.goals ("totalRevenueGoal","cashGoal","inKindGoal","totalExpenses","boardGivingGoal","channels")
VALUES (99500, 51500, 48000, 69249, 25000, '[
  {"name":"Individual Giving","goal":12000,"raised":6450},
  {"name":"Major Gifts","goal":15000,"raised":7500},
  {"name":"Grants","goal":35000,"raised":20000},
  {"name":"Corporate Sponsorships","goal":20000,"raised":11000},
  {"name":"Events","goal":12000,"raised":4500},
  {"name":"Program Fees","goal":5500,"raised":2100}
]'::jsonb);

-- Seed grants
INSERT INTO public.grants ("funderName","fundingType","priorityArea","geographicFocus","programFit","amountRequested","likelihood","deadline","status","loiDueDate","applicationDueDate","reportDueDate","contactName","contactEmail","relationshipNotes","nextStep","assignedOwner","documentsNeeded","submittedDate","decisionDate","awardAmount","declinedReason","renewalOpportunity","notes") VALUES
('Chicago Community Trust','Foundation','Youth Development','Cook County, IL','Pathways Academic & Leadership Academy',25000,'High','2026-03-15','Submitted','2026-01-15','2026-03-15','','Denise Walker','dwalker@cct.org','Program officer attended last year''s showcase.','Await decision; send Q1 program photos.','Executive Director','990, board list, budget','2026-03-10','',0,'',true,'Strong alignment with academic priority area.'),
('Polk Bros. Foundation','Foundation','Education & Out-of-School Time','Chicago','Great Lakes Academy Summer Enrichment Program',20000,'Medium','2026-05-01','LOI Submitted','2026-02-01','2026-05-01','','Marcus Lee','mlee@polkbros.org','Introduced by board member.','Follow up on invitation to full proposal.','Grants Manager','LOI, logic model','','',0,'',true,''),
('Nike Community Impact Fund','Corporate Foundation','Sports-Based Youth Development','Chicago Metro','The Kinetic Lab',15000,'High','2026-04-20','Awarded','','2026-02-20','2026-12-15','Tasha Bryant','tasha.bryant@nike.com','Multi-year supporter.','Submit interim report in December.','Grants Manager','Final report template','2026-02-18','2026-04-01',15000,'',true,'Funds STEM + movement curriculum.'),
('Crown Family Philanthropies','Family Foundation','Leadership Development','Illinois','General Operating Support',10000,'Medium','2026-06-30','Qualified','2026-04-15','2026-06-30','','Robert Crown','info@crownmemorial.org','Cold prospect; researching alignment.','Request intro meeting.','Executive Director','Case for support','','',0,'',false,''),
('Allstate Foundation','Corporate Foundation','Career Exposure','Chicagoland','Pathways Academic & Leadership Academy',12000,'Low','2026-02-28','Declined','','2026-01-28','','Jenny Park','jpark@allstate.com','','Re-apply next cycle with stronger outcomes data.','Grants Manager','','2026-01-25','2026-02-28',0,'Highly competitive cycle; encouraged to reapply.',true,''),
('Illinois DCEO Youth Grant','Government','STEM Education','Illinois','The Kinetic Lab',18000,'Medium','2026-06-15','Reporting Due','','2025-09-15','2026-06-30','State Program Office','grants@illinois.gov','Prior year awardee.','Compile final report and outcomes.','Grants Manager','Final narrative, financials','2025-09-12','2025-11-01',18000,'',true,'Report due to keep eligibility.');

-- Seed donors
INSERT INTO public.donors ("name","organization","type","givingCapacity","interestArea","connection","lastContact","nextStep","askAmount","stage","notes") VALUES
('James & Patricia Holloway','Holloway Family','Major Gift Prospect','$10,000+','Academic Programs','Board member referral','2026-05-12','Schedule lunch to discuss gift',10000,'Cultivation','Interested in scholarship naming.'),
('BMO Harris Bank','BMO Harris','Corporate Sponsor','$15,000','Golf Invitational','Existing sponsor','2026-06-01','Send 2026 sponsorship packet',15000,'Solicitation','Champion sponsor last year.'),
('Coach Reggie Daniels','Chicago Public League','Sports Leader','$1,000','Mentorship','Program volunteer','2026-04-20','Invite to fall showcase',1000,'Stewardship',''),
('Dr. Angela Foster','Foster Wellness Group','Individual Donor','$2,500','Wellness','Former athlete parent','2026-05-30','Send year-end appeal',2500,'Cultivation',''),
('Marcus Tran','Self','Former Athlete','$500','Career Exposure','Program alum (2014)','2026-03-15','Recruit as young professional ambassador',500,'Qualification','Now works in tech; great speaker.'),
('Liz Karbowski','SMART Sports Board','Board Contact','$5,000','General Operating','Board Treasurer','2026-06-05','Confirm board give for FY26',5000,'Solicitation',''),
('Grossman Family Foundation','Grossman Family Foundation','Foundation Contact','$20,000','STEM','Networking event','2026-05-18','Submit LOI',20000,'Identification','');

-- Seed golf sponsors
INSERT INTO public.golf_sponsors ("name","level","amount","confirmed","followUp") VALUES
('BMO Harris','Champion Sponsor',15000,true,'Send logo request'),
('Wintrust','Leadership Sponsor',10000,true,''),
('Local Auto Group','Foursome Sponsor',5000,false,'Awaiting signed agreement'),
('Riverside Dental','Hole Sponsor',1000,true,'');

-- Seed golf foursomes
INSERT INTO public.golf_foursomes ("captain","organization","players","amount","paid") VALUES
('Tom Becker','Becker Realty',4,2000,true),
('Sandra Liu','Liu CPA',4,2000,false);

-- Seed golf players
INSERT INTO public.golf_players ("name","organization","amount","paid") VALUES
('David Ortiz','Self',500,true),
('Karen Webb','Webb Designs',500,false);

-- Seed golf auction & in-kind
INSERT INTO public.golf_auction ("item","donor","estimatedValue","type") VALUES
('Cubs Suite Experience','Anonymous',3000,'Auction'),
('Signed Bulls Jersey','Sports Leader Network',800,'Auction'),
('Catering for Event','Taste of Chicago Catering',4500,'In-kind'),
('Golf Cart Sponsorship','Harborside',2500,'In-kind');

-- Seed golf expenses
INSERT INTO public.golf_expenses ("item","amount","category") VALUES
('Course & Greens Fees',12000,'Venue'),
('Catering (cash portion)',4000,'Food & Beverage'),
('Printing & Signage',1500,'Marketing'),
('Prizes & Awards',1200,'Program');

-- Seed board members
INSERT INTO public.board_members ("name","giveGoal","given","introductions","meetingsScheduled","prospectsAssigned","sponsorOutreach") VALUES
('Liz Karbowski',5000,5000,3,2,4,3),
('Andre Phillips',5000,2500,2,1,3,1),
('Maria Gonzalez',5000,5000,4,3,5,2),
('Kevin Wu',5000,1000,1,0,2,0),
('Denise Carter',5000,3000,2,2,3,2);