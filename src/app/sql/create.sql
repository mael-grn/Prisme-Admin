

create table users(
    id serial primary key,
    email varchar unique not null,
    first_name varchar not null,
    last_name varchar not null,
    password varchar not null
);

create table display_websites(
    id serial primary key,
    owner_id integer references users(id),
    website_domain varchar not null,
    auth_token varchar not null,
    hero_image_url varchar,
    hero_title varchar
);

create table pages(
    id serial primary key,
    path varchar not null,
    website_id integer references display_websites(id),
    icon_svg text,
    title varchar not null,
    description text,
    position int not null
);

create table categories(
    id serial primary key,
    name varchar not null
);

create table subcategories(
    id serial primary key,
    category_id integer references categories(id),
    name varchar not null
);

create table sections(
    id serial primary key,
    page_id integer references pages(id),
    section_type varchar not null,
    position int not null
);

create table sections_subcategories(
    section_id integer references sections(id),
    subcategory_id integer references subcategories(id),
    primary key(section_id, subcategory_id)
);

create table elements(
    id serial primary key,
    section_id integer references sections(id),
    element_type varchar not null,
    content text not null,
    position int not null
);