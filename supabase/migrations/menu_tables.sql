create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table menu_products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references menu_categories(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  image_url text,
  description text,
  is_available boolean default true,
  created_at timestamptz default now()
);
