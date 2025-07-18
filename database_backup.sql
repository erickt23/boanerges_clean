--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    event_id integer NOT NULL,
    member_id integer,
    visitor_first_name text,
    visitor_last_name text,
    attendance_method text NOT NULL,
    recorded_by integer NOT NULL,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    attendance_date timestamp without time zone DEFAULT now() NOT NULL,
    is_retroactive boolean DEFAULT false,
    notes text,
    last_modified_at timestamp without time zone DEFAULT now(),
    last_modified_by integer NOT NULL
);


ALTER TABLE public.attendance OWNER TO neondb_owner;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO neondb_owner;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id integer,
    old_values text,
    new_values text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_log OWNER TO neondb_owner;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO neondb_owner;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: donations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    member_id integer,
    donation_type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    donation_date date NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    notes text,
    receipt_number text,
    recorded_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.donations OWNER TO neondb_owner;

--
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donations_id_seq OWNER TO neondb_owner;

--
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    event_type text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    location text,
    is_recurring boolean DEFAULT false NOT NULL,
    recurring_pattern text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_special boolean DEFAULT false NOT NULL,
    show_on_landing_page boolean DEFAULT false NOT NULL
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: forum_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_categories OWNER TO neondb_owner;

--
-- Name: forum_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_categories_id_seq OWNER TO neondb_owner;

--
-- Name: forum_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_categories_id_seq OWNED BY public.forum_categories.id;


--
-- Name: forum_replies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_replies (
    id integer NOT NULL,
    topic_id integer NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    parent_reply_id integer,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL
);


ALTER TABLE public.forum_replies OWNER TO neondb_owner;

--
-- Name: forum_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_replies_id_seq OWNER TO neondb_owner;

--
-- Name: forum_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_replies_id_seq OWNED BY public.forum_replies.id;


--
-- Name: forum_topics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_topics (
    id integer NOT NULL,
    category_id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    is_sticky boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    reply_count integer DEFAULT 0 NOT NULL,
    last_reply_at timestamp without time zone,
    last_reply_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.forum_topics OWNER TO neondb_owner;

--
-- Name: forum_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_topics_id_seq OWNER TO neondb_owner;

--
-- Name: forum_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_topics_id_seq OWNED BY public.forum_topics.id;


--
-- Name: group_memberships; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.group_memberships (
    id integer NOT NULL,
    group_id integer NOT NULL,
    member_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_memberships OWNER TO neondb_owner;

--
-- Name: group_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.group_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_memberships_id_seq OWNER TO neondb_owner;

--
-- Name: group_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.group_memberships_id_seq OWNED BY public.group_memberships.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    leader_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO neondb_owner;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO neondb_owner;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.members (
    id integer NOT NULL,
    user_id integer,
    member_code character varying(20) NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL,
    phone text,
    email text,
    apartment text,
    building_number text,
    street text NOT NULL,
    city text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'Canada'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    province text,
    birth_year integer,
    has_forum_access boolean DEFAULT true,
    can_view_events boolean DEFAULT true,
    can_view_donations boolean DEFAULT true,
    login_pin character varying(255)
);


ALTER TABLE public.members OWNER TO neondb_owner;

--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.members_id_seq OWNER TO neondb_owner;

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: photo_albums; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.photo_albums (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    event_id integer,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.photo_albums OWNER TO neondb_owner;

--
-- Name: photo_albums_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.photo_albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.photo_albums_id_seq OWNER TO neondb_owner;

--
-- Name: photo_albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.photo_albums_id_seq OWNED BY public.photo_albums.id;


--
-- Name: photos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    album_id integer NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    caption text,
    uploaded_by integer NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL,
    media_type text DEFAULT 'photo'::text NOT NULL,
    file_size integer,
    duration integer,
    tags text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.photos OWNER TO neondb_owner;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.photos_id_seq OWNER TO neondb_owner;

--
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- Name: resource_reservations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resource_reservations (
    id integer NOT NULL,
    resource_id integer NOT NULL,
    event_id integer,
    reserved_by integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    purpose text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resource_reservations OWNER TO neondb_owner;

--
-- Name: resource_reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.resource_reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resource_reservations_id_seq OWNER TO neondb_owner;

--
-- Name: resource_reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.resource_reservations_id_seq OWNED BY public.resource_reservations.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    capacity integer,
    is_available boolean DEFAULT true NOT NULL
);


ALTER TABLE public.resources OWNER TO neondb_owner;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_id_seq OWNER TO neondb_owner;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    email text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    first_name text,
    last_name text,
    member_id integer,
    member_code character varying(20)
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: forum_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories ALTER COLUMN id SET DEFAULT nextval('public.forum_categories_id_seq'::regclass);


--
-- Name: forum_replies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies ALTER COLUMN id SET DEFAULT nextval('public.forum_replies_id_seq'::regclass);


--
-- Name: forum_topics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_topics ALTER COLUMN id SET DEFAULT nextval('public.forum_topics_id_seq'::regclass);


--
-- Name: group_memberships id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_memberships ALTER COLUMN id SET DEFAULT nextval('public.group_memberships_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: photo_albums id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photo_albums ALTER COLUMN id SET DEFAULT nextval('public.photo_albums_id_seq'::regclass);


--
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- Name: resource_reservations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resource_reservations ALTER COLUMN id SET DEFAULT nextval('public.resource_reservations_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attendance (id, event_id, member_id, visitor_first_name, visitor_last_name, attendance_method, recorded_by, recorded_at, attendance_date, is_retroactive, notes, last_modified_at, last_modified_by) FROM stdin;
3	2	11	\N	\N	manual	1	2025-05-30 23:26:58.703606	2025-05-30 23:26:58.703606	f	\N	2025-05-30 23:26:58.703606	1
4	2	9	\N	\N	manual	1	2025-05-30 23:26:58.708572	2025-05-30 23:26:58.708572	f	\N	2025-05-30 23:26:58.708572	1
6	2	5	\N	\N	manual	1	2025-05-30 23:26:58.713869	2025-05-30 23:26:58.713869	f	\N	2025-05-30 23:26:58.713869	1
8	2	10	\N	\N	manual	1	2025-05-30 23:26:58.720741	2025-05-30 23:26:58.720741	f	\N	2025-05-30 23:26:58.720741	1
9	2	2	\N	\N	manual	1	2025-05-30 23:37:48.449175	2025-05-30 23:37:48.449175	f	\N	2025-05-30 23:37:48.449175	1
10	2	3	\N	\N	manual	1	2025-05-30 23:37:48.446024	2025-05-30 23:37:48.446024	f	\N	2025-05-30 23:37:48.446024	1
11	2	1	\N	\N	manual	1	2025-05-30 23:37:48.436371	2025-05-30 23:37:48.436371	f	\N	2025-05-30 23:37:48.436371	1
15	5	10	\N	\N	manual	1	2025-05-31 19:37:25.650367	2025-05-31 19:37:25.650367	f	\N	2025-05-31 19:37:25.650367	1
16	5	11	\N	\N	manual	1	2025-05-31 19:37:25.660875	2025-05-31 19:37:25.660875	f	\N	2025-05-31 19:37:25.660875	1
17	5	9	\N	\N	manual	1	2025-05-31 19:37:25.668871	2025-05-31 19:37:25.668871	f	\N	2025-05-31 19:37:25.668871	1
18	5	8	\N	\N	manual	1	2025-05-31 19:48:54.502836	2025-05-31 19:48:54.502836	f	\N	2025-05-31 19:48:54.502836	1
19	5	7	\N	\N	manual	1	2025-05-31 19:48:54.503787	2025-05-31 19:48:54.503787	f	\N	2025-05-31 19:48:54.503787	1
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_log (id, user_id, action, table_name, record_id, old_values, new_values, "timestamp") FROM stdin;
1	1	CREATE	members	1	\N	{"id":1,"userId":null,"memberCode":"MEB130801","firstName":"Erick","lastName":"Toussaint","dateOfBirth":"1985-08-13","gender":"M","phone":"8736627656","email":"erick.toussaint23@gmail.com","apartment":"5","buildingNumber":"1566","street":"rue LaRocque","city":"Sherbrooke","postalCode":"J1H 4S3","country":"Canada","isActive":true,"createdAt":"2025-05-30T00:11:23.281Z"}	2025-05-30 00:11:23.334329
2	1	CREATE	members	2	\N	{"id":2,"userId":null,"memberCode":"MEB100501","firstName":"Dieula","lastName":"Toussaint","dateOfBirth":"1981-05-10","gender":"F","phone":"8736627757","email":"che.toussaint23@gmail.com","apartment":"5","buildingNumber":"1566","street":"rue LaRocque","city":"Sherbrooke","postalCode":"J1H 4S3","country":"Canada","isActive":true,"createdAt":"2025-05-30T00:12:14.749Z"}	2025-05-30 00:12:14.798108
3	1	CREATE	members	3	\N	{"id":3,"userId":null,"memberCode":"MEB130802","firstName":"Keza Nyota","lastName":"Toussaint","dateOfBirth":"2010-08-13","gender":"F","phone":"8738782656","email":"kezantoussaint@gmail.com","apartment":"5","buildingNumber":"1566","street":"rue LaRocque","city":"Sherbrooke","postalCode":"J1H 4S3","country":"Canada","isActive":true,"createdAt":"2025-05-30T00:13:20.131Z"}	2025-05-30 00:13:20.179435
4	1	CREATE	events	1	\N	{"id":1,"title":"Célébration de la Pentecôte","description":"Célébration de la Pentecôte","eventType":"service","startDate":"2025-06-08T14:30:00.000Z","endDate":"2025-06-08T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","createdBy":1,"createdAt":"2025-05-30T00:46:35.548Z"}	2025-05-30 00:46:35.607249
5	1	UPDATE	members	3	\N	{"id":3,"userId":null,"memberCode":"MEB130802","firstName":"Keza Nyota","lastName":"Toussaint","dateOfBirth":"2010-08-13","gender":"F","phone":"8738782656","email":"kezantoussaint@gmail.com","apartment":"5","buildingNumber":"1566","street":"rue LaRocque","city":"Sherbrooke","province":"QC","postalCode":"J1H 4S3","country":"Canada","isActive":true,"createdAt":"2025-05-30T00:13:20.131Z"}	2025-05-30 21:24:15.308781
6	1	CREATE	members	4	\N	{"id":4,"userId":null,"memberCode":"MEB140601","firstName":"Guillain","lastName":"Baraka","dateOfBirth":"1994-06-14","gender":"M","phone":"8193457022","email":"","apartment":"","buildingNumber":"1580","street":"rue de Dorval","city":"Sherbrooke","province":"QC","postalCode":"J1H 5Z1","country":"Canada","isActive":true,"createdAt":"2025-05-30T21:33:34.040Z"}	2025-05-30 21:33:34.096508
7	1	CREATE	members	5	\N	{"id":5,"userId":null,"memberCode":"MEB030101","firstName":"Suzy","lastName":"Beauda","dateOfBirth":"2001-01-03","gender":"F","phone":"5142491497","email":"","apartment":"","buildingNumber":"500","street":"500 rue Saint-François, Sherbrooke QC","city":"Sherbrooke","province":"QC","postalCode":"J1H 5Z1","country":"Canada","isActive":true,"createdAt":"2025-05-30T21:36:54.350Z"}	2025-05-30 21:36:54.406838
8	1	CREATE	members	6	\N	{"id":6,"userId":null,"memberCode":"MEB230201","firstName":"Elie","lastName":"Adegono","dateOfBirth":"1998-02-23","gender":"M","phone":"8194466719","email":"","apartment":"","buildingNumber":"","street":"N/A","city":"Sherbrooke","province":"QC","postalCode":"","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:15:18.665Z"}	2025-05-30 22:15:18.724539
9	1	CREATE	members	7	\N	{"id":7,"userId":null,"memberCode":"MEB041101","firstName":"Emilie","lastName":"Boivin","dateOfBirth":"1978-11-04","gender":"F","phone":"8194347195","email":"","apartment":"7","buildingNumber":"1059","street":"rue King Ouest","city":"Sherbroone","province":"QC","postalCode":"J1H 1S4","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:16:38.597Z"}	2025-05-30 22:16:38.650305
10	1	CREATE	events	2	\N	{"id":2,"title":"Evenement test du 30 mai","description":"Evenement test du 30 mai","eventType":"activity","startDate":"2025-05-30T22:00:00.000Z","endDate":"2025-05-31T00:00:00.000Z","location":"En plein air","isRecurring":false,"recurringPattern":"","createdBy":1,"createdAt":"2025-05-30T22:24:08.552Z"}	2025-05-30 22:24:08.629459
11	1	CREATE	members	8	\N	{"id":8,"userId":null,"memberCode":"MEB030801","firstName":"Lydie","lastName":"Azom","dateOfBirth":"2005-08-03","gender":"F","phone":"8195802498","email":"","apartment":"","buildingNumber":"550 ","street":"rue Belleau","city":"Sherbrooke","province":"QC","postalCode":"","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:42:50.942Z"}	2025-05-30 22:42:51.052394
12	1	CREATE	members	9	\N	{"id":9,"userId":null,"memberCode":"MEB201201","firstName":"Albert","lastName":"Barutwanayo","dateOfBirth":"1999-12-20","gender":"M","phone":"8197683638","email":"","apartment":"4","buildingNumber":"1674","street":"rue de Courville","city":"Sherbrooke","province":"QC","postalCode":"J1H 3W8","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:44:04.014Z"}	2025-05-30 22:44:04.070755
13	1	CREATE	members	10	\N	{"id":10,"userId":null,"memberCode":"MEB231001","firstName":"Christianne","lastName":"Bella","dateOfBirth":"2001-10-23","gender":"F","phone":"4385243615","email":"","apartment":"","buildingNumber":"4250","street":"rue Louis La Croix","city":"Sherbrooke","province":"QC","postalCode":"","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:45:21.718Z"}	2025-05-30 22:45:21.774797
14	1	CREATE	members	11	\N	{"id":11,"userId":null,"memberCode":"MEB110301","firstName":"Jean","lastName":"Katala","dateOfBirth":"2008-03-11","gender":"M","phone":"8192383188","email":"","apartment":"106","buildingNumber":"1580","street":"rue de Dorval","city":"Sherbrooke","province":"QC","postalCode":"J1H 5I1","country":"Canada","isActive":true,"createdAt":"2025-05-30T22:47:51.690Z"}	2025-05-30 22:47:51.745122
15	1	CREATE	donations	1	\N	{"id":1,"memberId":1,"donationType":"offering","amount":"25.00","donationDate":"2025-05-30","isAnonymous":false,"notes":null,"receiptNumber":"2025-000001","recordedBy":1,"createdAt":"2025-05-30T22:58:35.922Z"}	2025-05-30 22:58:35.983919
16	1	CREATE	donations	2	\N	{"id":2,"memberId":1,"donationType":"general","amount":"250.00","donationDate":"2025-05-29","isAnonymous":false,"notes":"Don pour l'achat du mixer 2/2","receiptNumber":"2025-000002","recordedBy":1,"createdAt":"2025-05-30T22:59:43.815Z"}	2025-05-30 22:59:43.864176
17	1	UPDATE	members	6	\N	{"id":6,"userId":null,"memberCode":"MEB230201","firstName":"Elie","lastName":"Adegono","dateOfBirth":"1998-02-23","gender":"M","phone":"8194466719","email":"","apartment":"","buildingNumber":"","street":"N/A","city":"Sherbrooke","province":"QC","postalCode":"","country":"Canada","isActive":false,"createdAt":"2025-05-30T22:15:18.665Z"}	2025-05-30 23:00:11.943181
18	1	UPDATE	members	8	\N	{"id":8,"userId":null,"memberCode":"MEB030801","firstName":"Lydie","lastName":"Azom","dateOfBirth":"2005-08-03","gender":"F","phone":"8195802498","email":"","apartment":"","buildingNumber":"550 ","street":"rue Belleau","city":"Sherbrooke","province":"QC","postalCode":"","country":"Canada","isActive":false,"createdAt":"2025-05-30T22:42:50.942Z"}	2025-05-30 23:01:05.108597
19	1	CREATE	members	12	\N	{"id":12,"userId":null,"memberCode":"MEB010101","firstName":"Test","lastName":"Test","dateOfBirth":"2000-01-01","gender":"M","phone":"8736627656","email":"adresse@email.com","apartment":"106","buildingNumber":"1580","street":"Lorem Ipsum Lorem Ipsum","city":"Sherbrooke","province":"QC","postalCode":"J1H 5I1","country":"Canada","isActive":true,"createdAt":"2025-05-30T23:16:34.879Z"}	2025-05-30 23:16:34.9269
50	1	CREATE	attendance	13	\N	{"id":13,"eventId":5,"memberId":14,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:36:38.310Z"}	2025-05-31 19:36:38.363852
20	1	CREATE	members	13	\N	{"id":13,"userId":null,"memberCode":"MEB060601","firstName":"aaaa","lastName":"bbbb","dateOfBirth":"2000-06-06","gender":"F","phone":"4385243615","email":"email2@domaine.com","apartment":"","buildingNumber":"4250","street":"adresse adresse adresse","city":"Sherbrooke","province":"QC","postalCode":"J1H 5I1","country":"Canada","isActive":true,"createdAt":"2025-05-30T23:17:24.045Z"}	2025-05-30 23:17:24.097348
21	1	CREATE	events	3	\N	{"id":3,"title":"Evenement test du 30 mai","description":"Evenement test du 30 mai","eventType":"meeting","startDate":"2025-05-31T00:00:00.000Z","endDate":"2025-05-31T03:59:00.000Z","location":"En plein air","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-30T23:21:15.234Z"}	2025-05-30 23:21:15.28749
22	1	CREATE	attendance	1	\N	{"id":1,"eventId":2,"memberId":13,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:25:55.418Z"}	2025-05-30 23:25:55.475475
23	1	CREATE	attendance	2	\N	{"id":2,"eventId":2,"memberId":12,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:25:55.426Z"}	2025-05-30 23:25:55.480403
24	1	CREATE	attendance	3	\N	{"id":3,"eventId":2,"memberId":11,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.703Z"}	2025-05-30 23:26:58.754875
25	1	CREATE	attendance	4	\N	{"id":4,"eventId":2,"memberId":9,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.708Z"}	2025-05-30 23:26:58.760058
26	1	CREATE	attendance	5	\N	{"id":5,"eventId":2,"memberId":13,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.710Z"}	2025-05-30 23:26:58.763635
27	1	CREATE	attendance	6	\N	{"id":6,"eventId":2,"memberId":5,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.713Z"}	2025-05-30 23:26:58.765118
28	1	CREATE	attendance	7	\N	{"id":7,"eventId":2,"memberId":12,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.714Z"}	2025-05-30 23:26:58.7666
29	1	CREATE	attendance	8	\N	{"id":8,"eventId":2,"memberId":10,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:26:58.720Z"}	2025-05-30 23:26:58.773394
30	1	CREATE	attendance	11	\N	{"id":11,"eventId":2,"memberId":1,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:37:48.436Z"}	2025-05-30 23:37:48.517476
31	1	CREATE	attendance	9	\N	{"id":9,"eventId":2,"memberId":2,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:37:48.449Z"}	2025-05-30 23:37:48.52069
32	1	CREATE	attendance	10	\N	{"id":10,"eventId":2,"memberId":3,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-30T23:37:48.446Z"}	2025-05-30 23:37:48.52158
33	1	CREATE	donations	3	\N	{"id":3,"memberId":2,"donationType":"offering","amount":"20.00","donationDate":"2025-05-31","isAnonymous":false,"notes":null,"receiptNumber":"2025-000003","recordedBy":1,"createdAt":"2025-05-31T04:41:25.910Z"}	2025-05-31 04:41:25.974771
34	1	CREATE	donations	4	\N	{"id":4,"memberId":2,"donationType":"tithe","amount":"130.00","donationDate":"2025-05-31","isAnonymous":false,"notes":null,"receiptNumber":"2025-000004","recordedBy":1,"createdAt":"2025-05-31T05:15:03.472Z"}	2025-05-31 05:15:03.535867
35	1	CREATE	events	4	\N	{"id":4,"title":"Culte ordinaire","description":"Culte ordinaire\\nDirection du service par: x\\nPrédication par: x","eventType":"service","startDate":"2025-06-01T14:30:00.000Z","endDate":"2025-06-01T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"createdBy":1,"createdAt":"2025-05-31T05:16:50.480Z"}	2025-05-31 05:16:50.545459
36	1	UPDATE	events	1	\N	{"id":1,"title":"Célébration de la Pentecôte","description":"Célébration de la Pentecôte","eventType":"service","startDate":"2025-06-08T18:30:00.000Z","endDate":"2025-06-08T20:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-30T00:46:35.548Z"}	2025-05-31 05:17:11.305226
37	1	UPDATE	events	1	\N	{"id":1,"title":"Célébration de la Pentecôte","description":"Célébration de la Pentecôte","eventType":"service","startDate":"2025-06-08T14:30:00.000Z","endDate":"2025-06-08T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-30T00:46:35.548Z"}	2025-05-31 05:17:47.436873
38	1	UPDATE	members	13	\N	{"isActive":false}	2025-05-31 13:46:21.82113
39	2	CREATE	members	14	\N	{"id":14,"userId":null,"memberCode":"MEB010102","firstName":"bbbb","lastName":"aaaa","dateOfBirth":"2000-01-01","gender":"F","phone":"1234567890","email":"email@domaine.com","apartment":"1","buildingNumber":"1","street":"rue de larue","city":"ville","province":"QC","postalCode":"j1h 4s3","country":"Canada","isActive":true,"createdAt":"2025-05-31T13:52:13.166Z"}	2025-05-31 13:52:13.222822
40	2	CREATE	members	15	\N	{"id":15,"userId":null,"memberCode":"MEB010103","firstName":"bbbb","lastName":"aaaa","dateOfBirth":"2000-01-01","gender":"F","phone":"1234567890","email":"email@domaine.com","apartment":"1","buildingNumber":"1","street":"rue de larue","city":"Sherbrooke","province":"QC","postalCode":"J1H 4S3","country":"Canada","isActive":true,"createdAt":"2025-05-31T13:53:32.949Z"}	2025-05-31 13:53:33.001698
41	2	UPDATE	members	15	\N	{"isActive":false}	2025-05-31 13:57:10.267043
42	1	UPDATE	members	14	\N	{"isActive":false}	2025-05-31 14:01:00.046736
43	1	UPDATE	members	6	\N	{"isActive":true}	2025-05-31 14:03:02.592937
44	1	UPDATE	members	8	\N	{"isActive":true}	2025-05-31 14:03:06.277253
45	1	DELETE	members	12	\N	{"isActive":false}	2025-05-31 14:03:54.817576
46	1	DELETE	members	15	\N	{"isActive":false}	2025-05-31 14:04:07.064873
47	1	DELETE	members	15	{"id":15,"userId":null,"memberCode":"MEB010103","firstName":"bbbb","lastName":"aaaa","dateOfBirth":"2000-01-01","gender":"F","phone":"1234567890","email":"email@domaine.com","apartment":"1","buildingNumber":"1","street":"rue de larue","city":"Sherbrooke","province":"QC","postalCode":"J1H 4S3","country":"Canada","isActive":false,"createdAt":"2025-05-31T13:53:32.949Z"}	\N	2025-05-31 14:12:40.585462
48	1	CREATE	events	5	\N	{"id":5,"title":"Activité test 31 mai","description":"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.","eventType":"activity","startDate":"2025-05-31T18:00:00.000Z","endDate":"2025-05-31T19:00:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"createdBy":1,"createdAt":"2025-05-31T18:59:42.419Z"}	2025-05-31 18:59:42.480554
49	1	CREATE	attendance	12	\N	{"id":12,"eventId":5,"memberId":13,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:36:38.289Z"}	2025-05-31 19:36:38.354548
51	1	CREATE	attendance	14	\N	{"id":14,"eventId":5,"memberId":12,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:36:38.328Z"}	2025-05-31 19:36:38.382244
52	1	CREATE	attendance	15	\N	{"id":15,"eventId":5,"memberId":10,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:37:25.650Z"}	2025-05-31 19:37:25.702355
53	1	CREATE	attendance	16	\N	{"id":16,"eventId":5,"memberId":11,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:37:25.660Z"}	2025-05-31 19:37:25.710313
54	1	CREATE	attendance	17	\N	{"id":17,"eventId":5,"memberId":9,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:37:25.668Z"}	2025-05-31 19:37:25.7207
55	1	CREATE	attendance	18	\N	{"id":18,"eventId":5,"memberId":8,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:48:54.502Z"}	2025-05-31 19:48:54.571376
56	1	CREATE	attendance	19	\N	{"id":19,"eventId":5,"memberId":7,"visitorFirstName":null,"visitorLastName":null,"attendanceMethod":"manual","recordedBy":1,"recordedAt":"2025-05-31T19:48:54.503Z"}	2025-05-31 19:48:54.573338
57	1	CREATE	events	6	\N	{"id":6,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-06-04T22:00:00.000Z","endDate":"2025-06-04T23:30:00.000Z","location":"906 rue King Ouest","isRecurring":false,"recurringPattern":"","isSpecial":false,"createdBy":1,"createdAt":"2025-06-04T19:58:26.955Z"}	2025-06-04 19:58:27.008392
58	1	CREATE	donations	5	\N	{"id":5,"memberId":1,"donationType":"offering","amount":"20.00","donationDate":"2025-06-04","isAnonymous":false,"notes":null,"receiptNumber":"2025-000005","recordedBy":1,"createdAt":"2025-06-04T23:43:21.157Z"}	2025-06-04 23:43:21.212676
59	1	CREATE	events	7	\N	{"id":7,"title":"Partage de la parole","description":"","eventType":"meeting","startDate":"2025-06-06T21:30:00.000Z","endDate":"2025-06-07T00:30:00.000Z","location":"","isRecurring":false,"recurringPattern":"","isSpecial":false,"createdBy":1,"createdAt":"2025-06-04T23:46:24.815Z"}	2025-06-04 23:46:24.877145
60	1	UPDATE	events	4	\N	{"id":4,"title":"Culte ordinaire","description":"Culte ordinaire\\nDirection du service par: x\\nPrédication par: x","eventType":"service","startDate":"2025-06-01T18:30:00.000Z","endDate":"2025-06-01T20:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-31T05:16:50.480Z"}	2025-06-04 23:46:43.22702
61	1	UPDATE	events	4	\N	{"id":4,"title":"Culte ordinaire","description":"Culte ordinaire\\nDirection du service par: x\\nPrédication par: x","eventType":"service","startDate":"2025-06-01T18:30:00.000Z","endDate":"2025-06-01T20:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-31T05:16:50.480Z"}	2025-06-04 23:46:44.394386
62	1	UPDATE	events	4	\N	{"id":4,"title":"Culte ordinaire","description":"Culte ordinaire\\nDirection du service par: x\\nPrédication par: x","eventType":"service","startDate":"2025-06-01T18:30:00.000Z","endDate":"2025-06-01T20:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":true,"createdBy":1,"createdAt":"2025-05-31T05:16:50.480Z"}	2025-06-04 23:46:45.592272
63	1	UPDATE	events	4	\N	{"id":4,"title":"Culte ordinaire","description":"Culte ordinaire\\nDirection du service par: x\\nPrédication par: x","eventType":"service","startDate":"2025-06-01T22:30:00.000Z","endDate":"2025-06-02T00:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"createdBy":1,"createdAt":"2025-05-31T05:16:50.480Z"}	2025-06-04 23:46:49.577877
64	1	UPDATE	events	10	\N	{"id":10,"title":"Partage de la parole","description":"Discussion sur des versets de la Bible","eventType":"activity","startDate":"2025-06-20T22:30:00.000Z","endDate":"2025-06-21T00:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-06T16:03:59.729Z"}	2025-06-06 17:51:37.545641
65	1	UPDATE	events	10	\N	{"id":10,"title":"Partage de la parole","description":"Discussion sur des versets de la Bible","eventType":"activity","startDate":"2025-06-21T02:30:00.000Z","endDate":"2025-06-21T04:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-06T16:03:59.729Z"}	2025-06-06 17:51:47.300119
66	1	UPDATE	members	1	\N	{"isActive":false}	2025-06-24 19:57:02.87153
67	1	UPDATE	members	1	\N	{"isActive":true}	2025-06-24 19:58:12.956379
68	1	CREATE	events	14	\N	{"id":14,"title":"Aphphatha","description":"","eventType":"service","startDate":"2025-06-28T20:00:00.000Z","endDate":"2025-06-28T23:00:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:37:29.874Z"}	2025-06-24 22:37:29.933151
69	1	UPDATE	events	14	\N	{"id":14,"title":"Ephphatha","description":"","eventType":"service","startDate":"2025-06-29T00:00:00.000Z","endDate":"2025-06-29T03:00:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:37:29.874Z"}	2025-06-24 22:37:38.220114
70	1	CREATE	events	15	\N	{"id":15,"title":"Culte ordinaire","description":"","eventType":"service","startDate":"2025-06-29T14:30:00.000Z","endDate":"2025-06-29T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-24 22:38:53.573033
71	4	UPDATE	events	15	\N	{"id":15,"title":"Culte ordinaires","description":"","eventType":"service","startDate":"2025-06-29T18:30:00.000Z","endDate":"2025-06-29T20:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-25 00:56:18.444563
72	4	UPDATE	events	15	\N	{"id":15,"title":"Culte ordinaire","description":"","eventType":"service","startDate":"2025-06-29T22:30:00.000Z","endDate":"2025-06-30T00:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-25 01:01:57.702803
73	4	UPDATE	events	15	\N	{"id":15,"title":"Culte ordinaires","description":"","eventType":"service","startDate":"2025-06-30T02:30:00.000Z","endDate":"2025-06-30T04:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-25 01:02:28.015139
74	4	UPDATE	events	15	\N	{"id":15,"title":"Culte ordinaire","description":"","eventType":"service","startDate":"2025-06-30T06:30:00.000Z","endDate":"2025-06-30T08:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-25 01:03:00.744519
75	1	UPDATE	events	15	\N	{"id":15,"title":"Culte ordinaire","description":"","eventType":"service","startDate":"2025-06-29T14:30:00.000Z","endDate":"2025-06-29T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:38:53.519Z"}	2025-06-25 01:27:52.169982
76	1	UPDATE	events	14	\N	{"id":14,"title":"Ephphatha","description":"","eventType":"service","startDate":"2025-06-29T20:30:00.000Z","endDate":"2025-06-29T23:00:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:37:29.874Z"}	2025-06-26 04:22:54.525494
77	1	UPDATE	events	14	\N	{"id":14,"title":"Ephphatha","description":"","eventType":"service","startDate":"2025-06-28T20:30:00.000Z","endDate":"2025-06-29T00:00:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-06-24T22:37:29.874Z"}	2025-06-26 04:23:34.519832
78	1	CREATE	events	16	\N	{"id":16,"title":"Service de prière ","description":"Service de prière","eventType":"service","startDate":"2025-07-02T22:00:00.000Z","endDate":"2025-07-02T23:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-01T19:01:24.405Z"}	2025-07-01 19:01:24.469718
79	1	CREATE	events	17	\N	{"id":17,"title":"Culte ordinaire","description":"Culte ordinaire","eventType":"service","startDate":"2025-07-06T14:30:00.000Z","endDate":"2025-07-06T16:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-01T19:02:26.023Z"}	2025-07-01 19:02:26.075808
80	1	CREATE	events	18	\N	{"id":18,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-07-09T21:00:00.000Z","endDate":"2025-07-09T23:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-04T01:19:06.304Z"}	2025-07-04 01:19:06.435623
81	1	CREATE	photo_albums	4	\N	{"id":4,"title":"Philosophie","description":"sad","eventId":4,"createdBy":1,"createdAt":"2025-07-05T16:35:48.469Z"}	2025-07-05 16:35:48.534088
82	1	CREATE	photos	8	\N	{"id":8,"albumId":4,"filename":"test","originalName":"test","caption":"","mediaType":"photo","fileSize":null,"duration":null,"tags":[],"uploadedBy":1,"uploadedAt":"2025-07-05T16:36:04.752Z"}	2025-07-05 16:36:04.816109
83	1	CREATE	photos	9	\N	{"id":9,"albumId":4,"filename":"deepseek_mermaid_20250521_559eb9.png","originalName":"deepseek_mermaid_20250521_559eb9.png","caption":"","mediaType":"photo","fileSize":140972,"duration":null,"tags":["Culte"],"uploadedBy":1,"uploadedAt":"2025-07-05T16:39:17.718Z"}	2025-07-05 16:39:17.768701
84	1	DELETE	photos	9	\N	{"deleted":true}	2025-07-05 16:39:33.563034
85	1	CREATE	photos	10	\N	{"id":10,"albumId":4,"filename":"rassemblement_communautaire.png","originalName":"rassemblement_communautaire.png","caption":"","mediaType":"photo","fileSize":6835535,"duration":null,"tags":["Sortie","Picnic"],"uploadedBy":1,"uploadedAt":"2025-07-05T16:40:03.691Z"}	2025-07-05 16:40:03.745307
86	1	CREATE	photos	11	\N	{"id":11,"albumId":4,"filename":"Screenshot_2024-10-04-14-36-03-53_6012fa4d4ddec268fc5c7112cbb265e7.jpg","originalName":"Screenshot_2024-10-04-14-36-03-53_6012fa4d4ddec268fc5c7112cbb265e7.jpg","caption":"test","mediaType":"photo","fileSize":850817,"duration":null,"tags":["test"],"uploadedBy":1,"uploadedAt":"2025-07-05T16:42:02.886Z"}	2025-07-05 16:42:02.952002
87	1	CREATE	photos	12	\N	{"id":12,"albumId":4,"filename":"1751737941953-196273175.png","originalName":"logo_hd.png","caption":"Logo de l'église","mediaType":"photo","fileSize":499064,"duration":null,"tags":["logo"],"uploadedBy":1,"uploadedAt":"2025-07-05T17:52:22.143Z"}	2025-07-05 17:52:22.205589
88	1	DELETE	photos	11	\N	{"deleted":true}	2025-07-05 17:52:27.398145
89	1	DELETE	photos	10	\N	{"deleted":true}	2025-07-05 17:52:30.037123
90	1	CREATE	photo_albums	5	\N	{"id":5,"title":"Cultes dominicaux","description":"Photos prises lors de nos cultes dominicaux","eventId":4,"createdBy":1,"createdAt":"2025-07-05T17:53:22.016Z"}	2025-07-05 17:53:22.065963
91	1	CREATE	photos	13	\N	{"id":13,"albumId":5,"filename":"1751738027837-342641081.png","originalName":"service_culte.png","caption":"Logo de l'église","mediaType":"photo","fileSize":5226755,"duration":null,"tags":["cultes","services","adoration","boanerges"],"uploadedBy":1,"uploadedAt":"2025-07-05T17:53:50.585Z"}	2025-07-05 17:53:50.630989
92	1	CREATE	photos	14	\N	{"id":14,"albumId":4,"filename":"1751777865042-923898277.jpg","originalName":"TheFourAgreements.jpg","caption":null,"mediaType":"photo","fileSize":78339,"duration":null,"tags":[],"uploadedBy":1,"uploadedAt":"2025-07-06T04:57:45.200Z"}	2025-07-06 04:57:45.34724
93	1	UPDATE	members	7	\N	{"isActive":false}	2025-07-07 02:33:44.488148
94	14	UPDATE	events	18	\N	{"id":18,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-07-10T01:00:00.000Z","endDate":"2025-07-10T03:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":false,"createdBy":1,"createdAt":"2025-07-04T01:19:06.304Z"}	2025-07-07 04:16:17.437291
95	14	UPDATE	events	18	\N	{"id":18,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-07-10T05:00:00.000Z","endDate":"2025-07-10T07:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-04T01:19:06.304Z"}	2025-07-07 04:16:42.046252
96	14	UPDATE	events	18	\N	{"id":18,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-07-09T22:00:00.000Z","endDate":"2025-07-09T23:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-04T01:19:06.304Z"}	2025-07-07 04:17:09.582185
97	1	DELETE	members	14	{"id":14,"userId":null,"memberCode":"MEB010102","firstName":"bbbb","lastName":"aaaa","dateOfBirth":"2000-01-01","gender":"F","phone":"1234567890","email":"email@domaine.com","apartment":"1","buildingNumber":"1","street":"rue de larue","city":"ville","province":"QC","postalCode":"j1h 4s3","country":"Canada","isActive":false,"createdAt":"2025-05-31T13:52:13.166Z"}	\N	2025-07-10 00:33:16.240091
98	1	DELETE	members	13	{"id":13,"userId":null,"memberCode":"MEB060601","firstName":"aaaa","lastName":"bbbb","dateOfBirth":"2000-06-06","gender":"F","phone":"4385243615","email":"email2@domaine.com","apartment":"","buildingNumber":"4250","street":"adresse adresse adresse","city":"Sherbrooke","province":"QC","postalCode":"J1H 5I1","country":"Canada","isActive":false,"createdAt":"2025-05-30T23:17:24.045Z"}	\N	2025-07-10 00:33:23.708804
99	1	DELETE	members	12	{"id":12,"userId":null,"memberCode":"MEB010101","firstName":"Test","lastName":"Test","dateOfBirth":"2000-01-01","gender":"M","phone":"8736627656","email":"adresse@email.com","apartment":"106","buildingNumber":"1580","street":"Lorem Ipsum Lorem Ipsum","city":"Sherbrooke","province":"QC","postalCode":"J1H 5I1","country":"Canada","isActive":false,"createdAt":"2025-05-30T23:16:34.879Z"}	\N	2025-07-10 00:33:28.709321
100	1	CREATE	events	19	\N	{"id":19,"title":"Culte ordinaire","description":"Culte ordinaire","eventType":"service","startDate":"2025-07-13T14:30:00.000Z","endDate":"2025-07-13T04:45:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":true,"recurringPattern":"weekly","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-10T00:34:41.647Z"}	2025-07-10 00:34:41.768283
101	1	CREATE	events	20	\N	{"id":20,"title":"Marche pour Jésus","description":"Un événement où tout le monde est invté, quelque soit votre église, quelque soit votre religion, pour proclamer le nom de Jésus","eventType":"service","startDate":"2025-07-12T17:00:00.000Z","endDate":"2025-07-12T21:00:00.000Z","location":"Parc du Domaine Howard","isRecurring":false,"recurringPattern":"","isSpecial":true,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-10T00:36:15.228Z"}	2025-07-10 00:36:15.3678
102	1	CREATE	events	21	\N	{"id":21,"title":"Service de prière ","description":"","eventType":"service","startDate":"2025-07-16T22:00:00.000Z","endDate":"2025-07-16T23:30:00.000Z","location":"906 rue King Ouest Sherbrooke","isRecurring":false,"recurringPattern":"","isSpecial":false,"showOnLandingPage":true,"createdBy":1,"createdAt":"2025-07-10T00:36:52.157Z"}	2025-07-10 00:36:52.265592
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.donations (id, member_id, donation_type, amount, donation_date, is_anonymous, notes, receipt_number, recorded_by, created_at) FROM stdin;
1	1	offering	25.00	2025-05-30	f	\N	2025-000001	1	2025-05-30 22:58:35.922795
2	1	general	250.00	2025-05-29	f	Don pour l'achat du mixer 2/2	2025-000002	1	2025-05-30 22:59:43.815307
3	2	offering	20.00	2025-05-31	f	\N	2025-000003	1	2025-05-31 04:41:25.910439
4	2	tithe	130.00	2025-05-31	f	\N	2025-000004	1	2025-05-31 05:15:03.47288
5	1	offering	20.00	2025-06-04	f	\N	2025-000005	1	2025-06-04 23:43:21.157053
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, title, description, event_type, start_date, end_date, location, is_recurring, recurring_pattern, created_by, created_at, is_special, show_on_landing_page) FROM stdin;
2	Evenement test du 30 mai	Evenement test du 30 mai	activity	2025-05-30 22:00:00	2025-05-31 00:00:00	En plein air	f		1	2025-05-30 22:24:08.552001	f	f
3	Evenement test du 30 mai	Evenement test du 30 mai	meeting	2025-05-31 00:00:00	2025-05-31 03:59:00	En plein air	f		1	2025-05-30 23:21:15.234685	t	f
1	Célébration de la Pentecôte	Célébration de la Pentecôte	service	2025-06-08 14:30:00	2025-06-08 16:45:00	906 rue King Ouest Sherbrooke	f		1	2025-05-30 00:46:35.548246	t	f
5	Activité test 31 mai	Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.	activity	2025-05-31 18:00:00	2025-05-31 19:00:00	906 rue King Ouest Sherbrooke	f		1	2025-05-31 18:59:42.419449	f	f
6	Service de prière 		service	2025-06-04 22:00:00	2025-06-04 23:30:00	906 rue King Ouest	f		1	2025-06-04 19:58:26.955371	f	f
4	Culte ordinaire	Culte ordinaire\nDirection du service par: x\nPrédication par: x	service	2025-06-01 22:30:00	2025-06-02 00:45:00	906 rue King Ouest Sherbrooke	f		1	2025-05-31 05:16:50.48021	f	f
11	Service de Jeunes	Culte spécialement dédié aux jeunes	youth	2025-06-15 15:00:00	2025-06-15 17:00:00	Salle des jeunes	f	\N	1	2025-06-06 16:03:59.729962	f	f
12	Conférence Spéciale	Conférence avec orateur invité	conference	2025-06-22 14:00:00	2025-06-22 16:30:00	Sanctuaire principal	f	\N	1	2025-06-06 16:03:59.729962	f	f
13	Repas Communautaire	Repas de partage entre membres	fellowship	2025-06-29 12:00:00	2025-06-29 15:00:00	Salle de fellowship	f	\N	1	2025-06-06 16:03:59.729962	f	f
7	Partage de la parole		meeting	2025-06-06 21:30:00	2025-06-07 00:30:00		f		1	2025-06-04 23:46:24.815162	f	t
8	Service Dominical	Service de culte dominical avec louange et prédication	service	2025-06-08 10:00:00	2025-06-08 12:00:00	Sanctuaire principal	f	\N	1	2025-06-06 16:03:59.729962	f	t
9	Étude Biblique	Étude approfondie des Écritures	study	2025-06-11 19:00:00	2025-06-11 21:00:00	Salle de réunion	f	\N	1	2025-06-06 16:03:59.729962	f	t
10	Partage de la parole	Discussion sur des versets de la Bible	activity	2025-06-21 02:30:00	2025-06-21 04:30:00	906 rue King Ouest Sherbrooke	f		1	2025-06-06 16:03:59.729962	f	t
15	Culte ordinaire		service	2025-06-29 14:30:00	2025-06-29 16:45:00	906 rue King Ouest Sherbrooke	t	weekly	1	2025-06-24 22:38:53.519074	f	t
14	Ephphatha		service	2025-06-28 20:30:00	2025-06-29 00:00:00	906 rue King Ouest Sherbrooke	f		1	2025-06-24 22:37:29.874242	f	t
16	Service de prière 	Service de prière	service	2025-07-02 22:00:00	2025-07-02 23:30:00	906 rue King Ouest Sherbrooke	t	weekly	1	2025-07-01 19:01:24.405067	f	t
17	Culte ordinaire	Culte ordinaire	service	2025-07-06 14:30:00	2025-07-06 16:45:00	906 rue King Ouest Sherbrooke	f		1	2025-07-01 19:02:26.023146	f	t
18	Service de prière 		service	2025-07-09 22:00:00	2025-07-09 23:30:00	906 rue King Ouest Sherbrooke	f		1	2025-07-04 01:19:06.30492	f	t
19	Culte ordinaire	Culte ordinaire	service	2025-07-13 14:30:00	2025-07-13 04:45:00	906 rue King Ouest Sherbrooke	t	weekly	1	2025-07-10 00:34:41.647517	f	t
20	Marche pour Jésus	Un événement où tout le monde est invté, quelque soit votre église, quelque soit votre religion, pour proclamer le nom de Jésus	service	2025-07-12 17:00:00	2025-07-12 21:00:00	Parc du Domaine Howard	f		1	2025-07-10 00:36:15.22803	t	t
21	Service de prière 		service	2025-07-16 22:00:00	2025-07-16 23:30:00	906 rue King Ouest Sherbrooke	f		1	2025-07-10 00:36:52.157637	f	t
\.


--
-- Data for Name: forum_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_categories (id, name, description, "order", is_active, created_at, updated_at) FROM stdin;
1	Général	Discussions générales entre les membres	1	t	2025-06-24 23:17:53.238034	2025-06-24 23:17:53.238034
4	Questions/Réponses	Questions théologiques et spirituelles	4	t	2025-06-24 23:17:53.238034	2025-06-24 23:17:53.238034
6	Questions Bibliques	Échanges et questions sur les Écritures	2	t	2025-07-01 21:53:23.297902	2025-07-01 21:53:23.297902
7	Prière et Intercession	Demandes de prière et témoignages	3	t	2025-07-01 21:53:23.297902	2025-07-01 21:53:23.297902
9	Announcements	Church announcements and important news	2	t	2025-07-04 02:38:12.572003	2025-07-04 02:38:12.572003
12	Uncategorized	Topics that have been moved from deleted categories	9999	t	2025-07-04 03:41:37.867	2025-07-04 03:41:37.867
\.


--
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_replies (id, topic_id, content, author_id, parent_reply_id, is_deleted, created_at, updated_at, is_hidden) FROM stdin;
1	1	Merci pour cet accueil chaleureux! Je suis nouveau dans la communauté et j'ai hâte de participer aux discussions.	5	\N	f	2025-07-01 21:54:01.616386	2025-07-01 21:54:01.616386	f
4	4	Les Psaumes sont si riches en enseignements! J'ai vraiment hâte de voir ce que le pasteur va partager.	5	\N	f	2025-07-01 21:54:01.616386	2025-07-01 21:54:01.616386	f
13	22	D'après les recommandations du pasteur Emmanuel, une première lecture intégrale peut se faire en lisant les 4 évangiles d'abord, puis les Actes des apôtres et les livres aux romains et aux corinthiens et ensuite revenir à Genèse. 	15	\N	f	2025-07-05 20:15:26.754389	2025-07-05 20:15:26.754389	f
14	22	Ce serait cool de pouvoir tester cette méthode	18	\N	f	2025-07-05 20:45:04.778664	2025-07-05 20:45:04.778664	f
\.


--
-- Data for Name: forum_topics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_topics (id, category_id, title, content, author_id, is_sticky, is_locked, view_count, reply_count, last_reply_at, last_reply_by, created_at, updated_at, is_hidden, is_archived) FROM stdin;
1	1	Bienvenue dans notre forum!	Nous sommes heureux de vous accueillir dans cet espace d'échange et de partage.	1	t	f	33	3	\N	\N	2025-07-01 21:53:32.529337	2025-07-05 21:20:29.356	f	f
4	1	Nouvelle série de prédications	Nous commençons une nouvelle série sur les Psaumes dimanche prochain. Qui a hâte?	1	f	f	20	4	\N	\N	2025-07-01 21:53:32.529337	2025-07-04 03:56:15.339	f	t
22	6	Quelle est la meilleure méthode pour lire la Bible: de manière linéaire ou autre?	Peut-on lire la Bible de manière linéaire du livre de Genèse à l'Apocalypse, comme on lirait un roman? Suivre un schéma particulier suivant une thématique et des référenes? Qu'est-ce qui a marché pour vous jusque là? Partagez vos idées avec nous dans les commentaires.	1	f	f	68	2	2025-07-05 20:45:04.819	18	2025-07-05 20:12:19.763834	2025-07-05 20:12:19.763834	f	f
\.


--
-- Data for Name: group_memberships; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.group_memberships (id, group_id, member_id, joined_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.groups (id, name, description, leader_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.members (id, user_id, member_code, first_name, last_name, date_of_birth, gender, phone, email, apartment, building_number, street, city, postal_code, country, is_active, created_at, province, birth_year, has_forum_access, can_view_events, can_view_donations, login_pin) FROM stdin;
2	\N	MEB100501	Dieula	Toussaint	1981-05-10	F	8736627757	che.toussaint23@gmail.com	5	1566	rue LaRocque	Sherbrooke	J1H 4S3	Canada	t	2025-05-30 00:12:14.749977	\N	1981	t	t	t	\N
3	\N	MEB130802	Keza Nyota	Toussaint	2010-08-13	F	8738782656	kezantoussaint@gmail.com	5	1566	rue LaRocque	Sherbrooke	J1H 4S3	Canada	t	2025-05-30 00:13:20.131146	QC	2010	t	t	t	\N
4	\N	MEB140601	Guillain	Baraka	1994-06-14	M	8193457022			1580	rue de Dorval	Sherbrooke	J1H 5Z1	Canada	t	2025-05-30 21:33:34.040678	QC	1994	t	t	t	\N
5	\N	MEB030101	Suzy	Beauda	2001-01-03	F	5142491497			500	500 rue Saint-François, Sherbrooke QC	Sherbrooke	J1H 5Z1	Canada	t	2025-05-30 21:36:54.350406	QC	2001	t	t	t	\N
9	\N	MEB201201	Albert	Barutwanayo	1999-12-20	M	8197683638		4	1674	rue de Courville	Sherbrooke	J1H 3W8	Canada	t	2025-05-30 22:44:04.014589	QC	1999	t	t	t	\N
10	\N	MEB231001	Christianne	Bella	2001-10-23	F	4385243615			4250	rue Louis La Croix	Sherbrooke		Canada	t	2025-05-30 22:45:21.718281	QC	2001	t	t	t	\N
11	\N	MEB110301	Jean	Katala	2008-03-11	M	8192383188		106	1580	rue de Dorval	Sherbrooke	J1H 5I1	Canada	t	2025-05-30 22:47:51.690054	QC	2008	t	t	t	\N
6	\N	MEB230201	Elie	Adegono	1998-02-23	M	8194466719				N/A	Sherbrooke		Canada	t	2025-05-30 22:15:18.665883	QC	1998	t	t	t	\N
8	\N	MEB030801	Lydie	Azom	2005-08-03	F	8195802498			550 	rue Belleau	Sherbrooke		Canada	t	2025-05-30 22:42:50.942519	QC	2005	t	t	t	\N
1	\N	MEB130801	Erick	Toussaint	1985-08-13	M	8736627656	erick.toussaint23@gmail.com	5	1566	rue LaRocque	Sherbrooke	J1H 4S3	Canada	t	2025-05-30 00:11:23.281802	\N	1985	t	t	t	$2b$10$xOHT6mp9ekOCavYjQnAteuPMayjEOGOcuUOjrjQAnAyeosCqCfq5a
7	\N	MEB041101	Emilie	Boivin	1978-11-04	F	8194347195		7	1059	rue King Ouest	Sherbroone	J1H 1S4	Canada	f	2025-05-30 22:16:38.597924	QC	1978	t	t	t	\N
\.


--
-- Data for Name: photo_albums; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.photo_albums (id, title, description, event_id, created_by, created_at) FROM stdin;
4	Philosophie	sad	4	1	2025-07-05 16:35:48.469453
5	Cultes dominicaux	Photos prises lors de nos cultes dominicaux	4	1	2025-07-05 17:53:22.016889
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.photos (id, album_id, filename, original_name, caption, uploaded_by, uploaded_at, media_type, file_size, duration, tags) FROM stdin;
12	4	1751737941953-196273175.png	logo_hd.png	Logo de l'église	1	2025-07-05 17:52:22.143466	photo	499064	\N	{logo}
13	5	1751738027837-342641081.png	service_culte.png	Logo de l'église	1	2025-07-05 17:53:50.585886	photo	5226755	\N	{cultes,services,adoration,boanerges}
14	4	1751777865042-923898277.jpg	TheFourAgreements.jpg	\N	1	2025-07-06 04:57:45.200719	photo	78339	\N	{}
\.


--
-- Data for Name: resource_reservations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.resource_reservations (id, resource_id, event_id, reserved_by, start_time, end_time, purpose, created_at) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.resources (id, name, type, description, capacity, is_available) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
imzqGuAH3t0CozUDIDK8zBKgqnjNqDPf	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-07-14 01:43:37
SiZnmdDMA7xMOm5_inTahz6dKJDptTZZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-07-16 22:04:45
VZpra_UzyGBb2NdikbBzgSVWnDNcnOXd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-07-16 20:09:55
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, email, is_active, created_at, first_name, last_name, member_id, member_code) FROM stdin;
15	MEB130802	0324fb15641b562d3588906bc47780b7bc4b33da11a230099f58f32ea39393dad0533feafc6a1a0f3459434b13a12f9931c3feb1bce407bd016f4ef9d9fe5599.salt	member	kezantoussaint@gmail.com	t	2025-07-01 18:52:48.812301	Keza Nyota	Toussaint	3	MEB130802
18	MEB140601	f69f9d9587c488a1c13a8401580151152b18491024cbeee5616146e676de8e601f3cf7382784de47c8add39164914a6e93683b53179842bc0e124d26f50c414c.salt	member		t	2025-07-01 18:52:48.812301	Guillain	Baraka	4	MEB140601
9	MEB201201	71a2d7990e12c2d6c8004b8b75fb9908f69d570711fcde0a879a26c1d1623a387cd344777a1146555f64a2827dab6141ce57911478a191ae1d1c09d45c15abe7.salt	member		t	2025-07-01 18:52:48.812301	Albert	Barutwanayo	9	MEB201201
2	admin2	7642caf6285a806eb9ce263085fd22ad75c2a16e02dcc57e24992cb735858964965eaa542ae4e88425ca5253974d6d56b169a6bb758f9af0dfcaa5648d5bb693.123b9653790f861cac03944fcaeeb530	admin	\N	t	2025-05-31 02:36:34.573734	\N	\N	\N	\N
17	MEB230201	696113279435bf6fcbdf213c20216177d94282cafe61e93350fc93a12f72b284d8d51ca03ce3e0705d36ddaf334f7fc1e6d0d1065eaab7a6e1ea0c51c70fed4f.salt	member		t	2025-07-01 18:52:48.812301	Elie	Adegono	6	MEB230201
13	MEB231001	c03732a678ee59de754a025991b5350d6e6883f9971b81e715b3a4811d167c99c080f3bf82d4046409461bee7a8eb1bb0c944ef660dc857bdb1322e0f6ac173e.salt	member		t	2025-07-01 18:52:48.812301	Christianne	Bella	10	MEB231001
1	erickt23	c7df2c70ad39692f50ef93f1ecce4ebc8c00f26736964f8315b56f6ce17e07d319647c3790552facf9843de8a9183918b11018c363b191c12de605e923dbdc2c.3ad0dca46ba5589589e24228e0036212	super_admin	erick.toussaint23@gmail.com	t	2025-05-30 00:05:59.273491	Erick	Toussaint	\N	\N
3	admin	f26f281b02b73f1e9d9352adf46d2672eddb03e52d1646c84a2346bd7adbbc1f35254f2965338f45f7321faa988a2da13cffbdb9dc8aa8530d10f27ea37f6fcf.20ca9ddb78beab398cce9789dc1ab165	admin		t	2025-06-25 00:37:22.803172	admin	admin	\N	\N
4	user	a5dbf75648f82a99d480f5f8230cc70aee9436827d8166cee6055f4ea255f0478734d0bf3e54caeee19b5a6398028c63e51955f09c66db7b298d473ec61107bb.326d8db449d90cce36370ee800e4e0b7	user		t	2025-06-25 00:38:32.614632	user	user	\N	\N
10	MEB010101	b2a5d29be13ba6cdc592176641d14ba689935edb18967c115cb5d20f8f7634f54aa01fc24599ae21fb5638ba853e120a5973acaf05f5741bc6507fd4de0258b2.salt	member	adresse@email.com	f	2025-07-01 18:52:48.812301	Test	Test	12	MEB010101
8	MEB010102	b2a5d29be13ba6cdc592176641d14ba689935edb18967c115cb5d20f8f7634f54aa01fc24599ae21fb5638ba853e120a5973acaf05f5741bc6507fd4de0258b2.salt	member	email@domaine.com	f	2025-07-01 18:52:48.812301	bbbb	aaaa	14	MEB010102
12	MEB030101	c03732a678ee59de754a025991b5350d6e6883f9971b81e715b3a4811d167c99c080f3bf82d4046409461bee7a8eb1bb0c944ef660dc857bdb1322e0f6ac173e.salt	member		t	2025-07-01 18:52:48.812301	Suzy	Beauda	5	MEB030101
16	MEB030801	b93a3e8762a48172c0d8c4fc97a2de7d1c87a52315033b6d253aaec5999c77d74f48a0d983e1bf2fd0ad5577f3de5080201d62304ed1ad93b63719cdf73dd05b.salt	member		t	2025-07-01 18:52:48.812301	Lydie	Azom	8	MEB030801
11	MEB041101	2d6a354b1d842ae74582ed5e04f2b33dcef38b44716d3b7bfd3c0b3c5e792ceb9e00eb4c53786df3c841c618a04c22b296083fc0a33b17fc1fcc7d3cfa4741aa.salt	member		t	2025-07-01 18:52:48.812301	Emilie	Boivin	7	MEB041101
7	MEB060601	b2a5d29be13ba6cdc592176641d14ba689935edb18967c115cb5d20f8f7634f54aa01fc24599ae21fb5638ba853e120a5973acaf05f5741bc6507fd4de0258b2.salt	member	email2@domaine.com	f	2025-07-01 18:52:48.812301	aaaa	bbbb	13	MEB060601
14	MEB100501	5d81a0238803747e73dad9aed6e32bdf1534724ee79fc10e4403a912a53c5c52aa6c795b8bd7cc4083d7345b0e018ada66ccad0012b24a258ecda1b913a55851.salt	member	che.toussaint23@gmail.com	t	2025-07-01 18:52:48.812301	Dieula	Toussaint	2	MEB100501
6	MEB110301	71e75bc1effbac84a445c2b2d5f97a9159bd0f9ea997812325bd769021abebafc1213d238a932beaa558ebe39055edae1e0aaa94eac7627f18001108091aa3af.salt	member		t	2025-07-01 18:52:48.812301	Jean	Katala	11	MEB110301
5	MEB130801	5339a81828afda96c0a723cf38449a0fe8a564cf0031094a00c8ca430c0d8fb19a0550ba4420c1c3204eaf9d1e8c997f249486b5472bd8db03b424a620180728.salt	member	erick.toussaint23@gmail.com	t	2025-07-01 18:39:27.782827	Erick	Toussaint	1	MEB130801
\.


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.attendance_id_seq', 30, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 102, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.donations_id_seq', 5, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.events_id_seq', 21, true);


--
-- Name: forum_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_categories_id_seq', 13, true);


--
-- Name: forum_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_replies_id_seq', 14, true);


--
-- Name: forum_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_topics_id_seq', 22, true);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.group_memberships_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.members_id_seq', 16, true);


--
-- Name: photo_albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.photo_albums_id_seq', 5, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.photos_id_seq', 14, true);


--
-- Name: resource_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.resource_reservations_id_seq', 1, false);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.resources_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: forum_categories forum_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories
    ADD CONSTRAINT forum_categories_pkey PRIMARY KEY (id);


--
-- Name: forum_replies forum_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_pkey PRIMARY KEY (id);


--
-- Name: forum_topics forum_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT forum_topics_pkey PRIMARY KEY (id);


--
-- Name: group_memberships group_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT group_memberships_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: members members_member_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_member_code_unique UNIQUE (member_code);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: photo_albums photo_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photo_albums
    ADD CONSTRAINT photo_albums_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: resource_reservations resource_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: attendance unique_member_event_attendance; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT unique_member_event_attendance UNIQUE (event_id, member_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: attendance attendance_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: attendance attendance_member_id_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_member_id_members_id_fk FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: attendance attendance_recorded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_recorded_by_users_id_fk FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: audit_log audit_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: donations donations_member_id_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_member_id_members_id_fk FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: donations donations_recorded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_recorded_by_users_id_fk FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: events events_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: forum_replies forum_replies_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: forum_replies forum_replies_parent_reply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.forum_replies(id);


--
-- Name: forum_replies forum_replies_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.forum_topics(id);


--
-- Name: forum_topics forum_topics_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT forum_topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: forum_topics forum_topics_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT forum_topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.forum_categories(id);


--
-- Name: forum_topics forum_topics_last_reply_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_topics
    ADD CONSTRAINT forum_topics_last_reply_by_fkey FOREIGN KEY (last_reply_by) REFERENCES public.users(id);


--
-- Name: group_memberships group_memberships_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT group_memberships_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: group_memberships group_memberships_member_id_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT group_memberships_member_id_members_id_fk FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: groups groups_leader_id_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_leader_id_members_id_fk FOREIGN KEY (leader_id) REFERENCES public.members(id);


--
-- Name: members members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: photo_albums photo_albums_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photo_albums
    ADD CONSTRAINT photo_albums_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: photo_albums photo_albums_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photo_albums
    ADD CONSTRAINT photo_albums_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: photos photos_album_id_photo_albums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_album_id_photo_albums_id_fk FOREIGN KEY (album_id) REFERENCES public.photo_albums(id);


--
-- Name: photos photos_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: resource_reservations resource_reservations_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: resource_reservations resource_reservations_reserved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_reserved_by_users_id_fk FOREIGN KEY (reserved_by) REFERENCES public.users(id);


--
-- Name: resource_reservations resource_reservations_resource_id_resources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_resource_id_resources_id_fk FOREIGN KEY (resource_id) REFERENCES public.resources(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

