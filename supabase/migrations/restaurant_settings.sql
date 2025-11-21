alter table restaurants
  add column if not exists city text,
  add column if not exists area text,
  add column if not exists address_landmark text,
  add column if not exists status_override text default 'auto',
  add column if not exists short_description text,
  add column if not exists long_description text;
