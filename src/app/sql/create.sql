

create table users(
    id serial primary key,
    email varchar unique not null,
    first_name varchar not null,
    last_name varchar not null,
    password varchar not null
);

create table display_websites(
    id serial primary key,
    owner_id integer references users(id) ON DELETE CASCADE,
    title varchar not null,
    website_domain varchar unique,
    hero_image_url varchar,
    hero_title varchar not null
);

create table pages(
    id serial primary key,
    path varchar not null unique,
    website_id integer references display_websites(id) ON DELETE CASCADE,
    icon_svg text,
    title varchar not null,
    description text,
    position int not null
);

create table categories(
    id serial primary key,
    name varchar not null unique
);

create table subcategories(
    id serial primary key,
    category_id integer references categories(id) ON DELETE CASCADE,
    name varchar not null,
    unique(category_id, name)
);

create table sections(
    id serial primary key,
    title varchar not null,
    page_id integer references pages(id) ON DELETE CASCADE,
    section_type varchar not null,
    position int not null
);

create table sections_subcategories(
    section_id integer references sections(id) ON DELETE CASCADE,
    subcategory_id integer references subcategories(id) ON DELETE CASCADE,
    primary key(section_id, subcategory_id)
);

create table elements(
    id serial primary key,
    section_id integer references sections(id) ON DELETE CASCADE,
    element_type varchar not null,
    content text not null,
    position int not null
);