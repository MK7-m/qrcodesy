create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  cover_image_url text,
  description text,
  rating float default 0,
  rating_count int default 0,
  cuisine_summary text,
  phone_number text,
  whatsapp_number text,
  delivery_fee numeric default 0,
  opening_hours jsonb not null default '[]',
  created_at timestamptz default now()
);

create table restaurant_reviews (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  author_name text not null,
  rating int not null,
  comment text,
  created_at timestamptz default now()
);
