--
-- PostgreSQL database dump
--

-- Dumped from database version 15.7
-- Dumped by pg_dump version 16.3

-- Started on 2024-05-23 11:36:40

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
-- TOC entry 216 (class 1259 OID 17622)
-- Name: client; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.client (
    client_id integer NOT NULL,
    "user" integer NOT NULL,
    client_sold double precision NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    telephone text
);


ALTER TABLE public.client OWNER TO avnadmin;

--
-- TOC entry 214 (class 1259 OID 17620)
-- Name: client_client_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_client_id_seq OWNER TO avnadmin;

--
-- TOC entry 4506 (class 0 OID 0)
-- Dependencies: 214
-- Name: client_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_client_id_seq OWNED BY public.client.client_id;


--
-- TOC entry 221 (class 1259 OID 17635)
-- Name: client_payment; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.client_payment (
    payment_id integer NOT NULL,
    "user" integer NOT NULL,
    client integer NOT NULL,
    work integer NOT NULL,
    date date NOT NULL,
    sum integer NOT NULL
);


ALTER TABLE public.client_payment OWNER TO avnadmin;

--
-- TOC entry 219 (class 1259 OID 17633)
-- Name: client_payment_client_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_payment_client_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_payment_client_seq OWNER TO avnadmin;

--
-- TOC entry 4507 (class 0 OID 0)
-- Dependencies: 219
-- Name: client_payment_client_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_payment_client_seq OWNED BY public.client_payment.client;


--
-- TOC entry 217 (class 1259 OID 17631)
-- Name: client_payment_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_payment_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_payment_payment_id_seq OWNER TO avnadmin;

--
-- TOC entry 4508 (class 0 OID 0)
-- Dependencies: 217
-- Name: client_payment_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_payment_payment_id_seq OWNED BY public.client_payment.payment_id;


--
-- TOC entry 218 (class 1259 OID 17632)
-- Name: client_payment_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_payment_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_payment_user_seq OWNER TO avnadmin;

--
-- TOC entry 4509 (class 0 OID 0)
-- Dependencies: 218
-- Name: client_payment_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_payment_user_seq OWNED BY public.client_payment."user";


--
-- TOC entry 220 (class 1259 OID 17634)
-- Name: client_payment_work_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_payment_work_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_payment_work_seq OWNER TO avnadmin;

--
-- TOC entry 4510 (class 0 OID 0)
-- Dependencies: 220
-- Name: client_payment_work_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_payment_work_seq OWNED BY public.client_payment.work;


--
-- TOC entry 215 (class 1259 OID 17621)
-- Name: client_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.client_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_user_seq OWNER TO avnadmin;

--
-- TOC entry 4511 (class 0 OID 0)
-- Dependencies: 215
-- Name: client_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.client_user_seq OWNED BY public.client."user";


--
-- TOC entry 223 (class 1259 OID 17645)
-- Name: color; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.color (
    color_id integer NOT NULL,
    name text NOT NULL,
    material_type text NOT NULL,
    active boolean NOT NULL,
    dimension integer[],
    rotable boolean NOT NULL,
    img_url text NOT NULL
);


ALTER TABLE public.color OWNER TO avnadmin;

--
-- TOC entry 222 (class 1259 OID 17644)
-- Name: color_color_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.color_color_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_color_id_seq OWNER TO avnadmin;

--
-- TOC entry 4512 (class 0 OID 0)
-- Dependencies: 222
-- Name: color_color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.color_color_id_seq OWNED BY public.color.color_id;


--
-- TOC entry 227 (class 1259 OID 17656)
-- Name: created_item; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.created_item (
    item_id integer NOT NULL,
    name text NOT NULL,
    material text NOT NULL,
    qty integer NOT NULL,
    size integer[] NOT NULL,
    "position" integer[] NOT NULL,
    rotation integer[] NOT NULL,
    color integer NOT NULL,
    rotable boolean NOT NULL,
    object integer NOT NULL
);


ALTER TABLE public.created_item OWNER TO avnadmin;

--
-- TOC entry 225 (class 1259 OID 17654)
-- Name: created_item_color_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.created_item_color_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.created_item_color_seq OWNER TO avnadmin;

--
-- TOC entry 4513 (class 0 OID 0)
-- Dependencies: 225
-- Name: created_item_color_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.created_item_color_seq OWNED BY public.created_item.color;


--
-- TOC entry 224 (class 1259 OID 17653)
-- Name: created_item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.created_item_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.created_item_item_id_seq OWNER TO avnadmin;

--
-- TOC entry 4514 (class 0 OID 0)
-- Dependencies: 224
-- Name: created_item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.created_item_item_id_seq OWNED BY public.created_item.item_id;


--
-- TOC entry 226 (class 1259 OID 17655)
-- Name: created_item_object_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.created_item_object_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.created_item_object_seq OWNER TO avnadmin;

--
-- TOC entry 4515 (class 0 OID 0)
-- Dependencies: 226
-- Name: created_item_object_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.created_item_object_seq OWNED BY public.created_item.object;


--
-- TOC entry 233 (class 1259 OID 17671)
-- Name: object; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.object (
    object_id integer NOT NULL,
    work integer NOT NULL,
    "user" integer NOT NULL,
    client integer NOT NULL,
    name text,
    used_script integer NOT NULL,
    used_colors text[]
);


ALTER TABLE public.object OWNER TO avnadmin;

--
-- TOC entry 231 (class 1259 OID 17669)
-- Name: object_client_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.object_client_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.object_client_seq OWNER TO avnadmin;

--
-- TOC entry 4516 (class 0 OID 0)
-- Dependencies: 231
-- Name: object_client_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.object_client_seq OWNED BY public.object.client;


--
-- TOC entry 228 (class 1259 OID 17666)
-- Name: object_object_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.object_object_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.object_object_id_seq OWNER TO avnadmin;

--
-- TOC entry 4517 (class 0 OID 0)
-- Dependencies: 228
-- Name: object_object_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.object_object_id_seq OWNED BY public.object.object_id;


--
-- TOC entry 232 (class 1259 OID 17670)
-- Name: object_used_script_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.object_used_script_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.object_used_script_seq OWNER TO avnadmin;

--
-- TOC entry 4518 (class 0 OID 0)
-- Dependencies: 232
-- Name: object_used_script_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.object_used_script_seq OWNED BY public.object.used_script;


--
-- TOC entry 230 (class 1259 OID 17668)
-- Name: object_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.object_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.object_user_seq OWNER TO avnadmin;

--
-- TOC entry 4519 (class 0 OID 0)
-- Dependencies: 230
-- Name: object_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.object_user_seq OWNED BY public.object."user";


--
-- TOC entry 229 (class 1259 OID 17667)
-- Name: object_work_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.object_work_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.object_work_seq OWNER TO avnadmin;

--
-- TOC entry 4520 (class 0 OID 0)
-- Dependencies: 229
-- Name: object_work_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.object_work_seq OWNED BY public.object.work;


--
-- TOC entry 236 (class 1259 OID 17685)
-- Name: script; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.script (
    script_id integer NOT NULL,
    name text NOT NULL,
    "user" integer NOT NULL,
    img_url text
);


ALTER TABLE public.script OWNER TO avnadmin;

--
-- TOC entry 239 (class 1259 OID 17696)
-- Name: script_item; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.script_item (
    item_id integer NOT NULL,
    script_id integer NOT NULL,
    name text NOT NULL,
    material text NOT NULL,
    qty integer,
    size integer[] NOT NULL,
    "position" integer[] NOT NULL,
    rotation integer[] NOT NULL
);


ALTER TABLE public.script_item OWNER TO avnadmin;

--
-- TOC entry 237 (class 1259 OID 17694)
-- Name: script_item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.script_item_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_item_item_id_seq OWNER TO avnadmin;

--
-- TOC entry 4521 (class 0 OID 0)
-- Dependencies: 237
-- Name: script_item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.script_item_item_id_seq OWNED BY public.script_item.item_id;


--
-- TOC entry 238 (class 1259 OID 17695)
-- Name: script_item_script_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.script_item_script_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_item_script_id_seq OWNER TO avnadmin;

--
-- TOC entry 4522 (class 0 OID 0)
-- Dependencies: 238
-- Name: script_item_script_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.script_item_script_id_seq OWNED BY public.script_item.script_id;


--
-- TOC entry 234 (class 1259 OID 17683)
-- Name: script_script_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.script_script_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_script_id_seq OWNER TO avnadmin;

--
-- TOC entry 4523 (class 0 OID 0)
-- Dependencies: 234
-- Name: script_script_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.script_script_id_seq OWNED BY public.script.script_id;


--
-- TOC entry 235 (class 1259 OID 17684)
-- Name: script_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.script_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_user_seq OWNER TO avnadmin;

--
-- TOC entry 4524 (class 0 OID 0)
-- Dependencies: 235
-- Name: script_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.script_user_seq OWNED BY public.script."user";


--
-- TOC entry 244 (class 1259 OID 17716)
-- Name: user_payment; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.user_payment (
    payment_id integer NOT NULL,
    "user" integer NOT NULL,
    date date NOT NULL,
    sum integer NOT NULL
);


ALTER TABLE public.user_payment OWNER TO avnadmin;

--
-- TOC entry 242 (class 1259 OID 17714)
-- Name: user_payment_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.user_payment_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_payment_payment_id_seq OWNER TO avnadmin;

--
-- TOC entry 4525 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_payment_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.user_payment_payment_id_seq OWNED BY public.user_payment.payment_id;


--
-- TOC entry 243 (class 1259 OID 17715)
-- Name: user_payment_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.user_payment_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_payment_user_seq OWNER TO avnadmin;

--
-- TOC entry 4526 (class 0 OID 0)
-- Dependencies: 243
-- Name: user_payment_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.user_payment_user_seq OWNED BY public.user_payment."user";


--
-- TOC entry 241 (class 1259 OID 17706)
-- Name: users; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name text NOT NULL,
    address text,
    telephone text,
    username text NOT NULL,
    sold double precision NOT NULL
);


ALTER TABLE public.users OWNER TO avnadmin;

--
-- TOC entry 240 (class 1259 OID 17705)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO avnadmin;

--
-- TOC entry 4527 (class 0 OID 0)
-- Dependencies: 240
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 248 (class 1259 OID 17726)
-- Name: work; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.work (
    work_id integer NOT NULL,
    "user" integer NOT NULL,
    client integer NOT NULL,
    name text,
    status text NOT NULL,
    price integer NOT NULL,
    paid integer NOT NULL,
    measure_date date,
    order_date date,
    finish_date date
);


ALTER TABLE public.work OWNER TO avnadmin;

--
-- TOC entry 247 (class 1259 OID 17725)
-- Name: work_client_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.work_client_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_client_seq OWNER TO avnadmin;

--
-- TOC entry 4528 (class 0 OID 0)
-- Dependencies: 247
-- Name: work_client_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.work_client_seq OWNED BY public.work.client;


--
-- TOC entry 246 (class 1259 OID 17724)
-- Name: work_user_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.work_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_user_seq OWNER TO avnadmin;

--
-- TOC entry 4529 (class 0 OID 0)
-- Dependencies: 246
-- Name: work_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.work_user_seq OWNED BY public.work."user";


--
-- TOC entry 245 (class 1259 OID 17723)
-- Name: work_work_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.work_work_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_work_id_seq OWNER TO avnadmin;

--
-- TOC entry 4530 (class 0 OID 0)
-- Dependencies: 245
-- Name: work_work_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.work_work_id_seq OWNED BY public.work.work_id;


--
-- TOC entry 4266 (class 2604 OID 17625)
-- Name: client client_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client ALTER COLUMN client_id SET DEFAULT nextval('public.client_client_id_seq'::regclass);


--
-- TOC entry 4267 (class 2604 OID 17626)
-- Name: client user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client ALTER COLUMN "user" SET DEFAULT nextval('public.client_user_seq'::regclass);


--
-- TOC entry 4268 (class 2604 OID 17638)
-- Name: client_payment payment_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment ALTER COLUMN payment_id SET DEFAULT nextval('public.client_payment_payment_id_seq'::regclass);


--
-- TOC entry 4269 (class 2604 OID 17639)
-- Name: client_payment user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment ALTER COLUMN "user" SET DEFAULT nextval('public.client_payment_user_seq'::regclass);


--
-- TOC entry 4270 (class 2604 OID 17640)
-- Name: client_payment client; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment ALTER COLUMN client SET DEFAULT nextval('public.client_payment_client_seq'::regclass);


--
-- TOC entry 4271 (class 2604 OID 17641)
-- Name: client_payment work; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment ALTER COLUMN work SET DEFAULT nextval('public.client_payment_work_seq'::regclass);


--
-- TOC entry 4272 (class 2604 OID 17648)
-- Name: color color_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.color ALTER COLUMN color_id SET DEFAULT nextval('public.color_color_id_seq'::regclass);


--
-- TOC entry 4273 (class 2604 OID 17659)
-- Name: created_item item_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.created_item ALTER COLUMN item_id SET DEFAULT nextval('public.created_item_item_id_seq'::regclass);


--
-- TOC entry 4274 (class 2604 OID 17660)
-- Name: created_item color; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.created_item ALTER COLUMN color SET DEFAULT nextval('public.created_item_color_seq'::regclass);


--
-- TOC entry 4275 (class 2604 OID 17661)
-- Name: created_item object; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.created_item ALTER COLUMN object SET DEFAULT nextval('public.created_item_object_seq'::regclass);


--
-- TOC entry 4276 (class 2604 OID 17674)
-- Name: object object_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object ALTER COLUMN object_id SET DEFAULT nextval('public.object_object_id_seq'::regclass);


--
-- TOC entry 4277 (class 2604 OID 17675)
-- Name: object work; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object ALTER COLUMN work SET DEFAULT nextval('public.object_work_seq'::regclass);


--
-- TOC entry 4278 (class 2604 OID 17676)
-- Name: object user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object ALTER COLUMN "user" SET DEFAULT nextval('public.object_user_seq'::regclass);


--
-- TOC entry 4279 (class 2604 OID 17677)
-- Name: object client; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object ALTER COLUMN client SET DEFAULT nextval('public.object_client_seq'::regclass);


--
-- TOC entry 4280 (class 2604 OID 17678)
-- Name: object used_script; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object ALTER COLUMN used_script SET DEFAULT nextval('public.object_used_script_seq'::regclass);


--
-- TOC entry 4281 (class 2604 OID 17688)
-- Name: script script_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script ALTER COLUMN script_id SET DEFAULT nextval('public.script_script_id_seq'::regclass);


--
-- TOC entry 4282 (class 2604 OID 17689)
-- Name: script user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script ALTER COLUMN "user" SET DEFAULT nextval('public.script_user_seq'::regclass);


--
-- TOC entry 4283 (class 2604 OID 17699)
-- Name: script_item item_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script_item ALTER COLUMN item_id SET DEFAULT nextval('public.script_item_item_id_seq'::regclass);


--
-- TOC entry 4284 (class 2604 OID 17700)
-- Name: script_item script_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script_item ALTER COLUMN script_id SET DEFAULT nextval('public.script_item_script_id_seq'::regclass);


--
-- TOC entry 4286 (class 2604 OID 17719)
-- Name: user_payment payment_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.user_payment ALTER COLUMN payment_id SET DEFAULT nextval('public.user_payment_payment_id_seq'::regclass);


--
-- TOC entry 4287 (class 2604 OID 17720)
-- Name: user_payment user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.user_payment ALTER COLUMN "user" SET DEFAULT nextval('public.user_payment_user_seq'::regclass);


--
-- TOC entry 4285 (class 2604 OID 17709)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4288 (class 2604 OID 17729)
-- Name: work work_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work ALTER COLUMN work_id SET DEFAULT nextval('public.work_work_id_seq'::regclass);


--
-- TOC entry 4289 (class 2604 OID 17730)
-- Name: work user; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work ALTER COLUMN "user" SET DEFAULT nextval('public.work_user_seq'::regclass);


--
-- TOC entry 4290 (class 2604 OID 17731)
-- Name: work client; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work ALTER COLUMN client SET DEFAULT nextval('public.work_client_seq'::regclass);


--
-- TOC entry 4468 (class 0 OID 17622)
-- Dependencies: 216
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.client (client_id, "user", client_sold, name, description, address, telephone) FROM stdin;
\.


--
-- TOC entry 4473 (class 0 OID 17635)
-- Dependencies: 221
-- Data for Name: client_payment; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.client_payment (payment_id, "user", client, work, date, sum) FROM stdin;
\.


--
-- TOC entry 4475 (class 0 OID 17645)
-- Dependencies: 223
-- Data for Name: color; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.color (color_id, name, material_type, active, dimension, rotable, img_url) FROM stdin;
\.


--
-- TOC entry 4479 (class 0 OID 17656)
-- Dependencies: 227
-- Data for Name: created_item; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.created_item (item_id, name, material, qty, size, "position", rotation, color, rotable, object) FROM stdin;
\.


--
-- TOC entry 4485 (class 0 OID 17671)
-- Dependencies: 233
-- Data for Name: object; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.object (object_id, work, "user", client, name, used_script, used_colors) FROM stdin;
\.


--
-- TOC entry 4488 (class 0 OID 17685)
-- Dependencies: 236
-- Data for Name: script; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.script (script_id, name, "user", img_url) FROM stdin;
\.


--
-- TOC entry 4491 (class 0 OID 17696)
-- Dependencies: 239
-- Data for Name: script_item; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.script_item (item_id, script_id, name, material, qty, size, "position", rotation) FROM stdin;
\.


--
-- TOC entry 4496 (class 0 OID 17716)
-- Dependencies: 244
-- Data for Name: user_payment; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.user_payment (payment_id, "user", date, sum) FROM stdin;
\.


--
-- TOC entry 4493 (class 0 OID 17706)
-- Dependencies: 241
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (user_id, name, address, telephone, username, sold) FROM stdin;
1	Jane Doe	456 Oak Street	555-5678	janedoe	1000
2	Jane Doe	456 Oak Street	555-5678	janedoe	1000
3	Jane Doe	456 Oak Street	555-5678	janedoe	1000
4	Jane Doe	456 Oak Street	555-5678	janedoe	1000
5	Jane Doe	456 Oak Street	555-5678	janedoe	1000
6	Jane Doe	456 Oak Street	555-5678	janedoe	1000
\.


--
-- TOC entry 4500 (class 0 OID 17726)
-- Dependencies: 248
-- Data for Name: work; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.work (work_id, "user", client, name, status, price, paid, measure_date, order_date, finish_date) FROM stdin;
\.


--
-- TOC entry 4531 (class 0 OID 0)
-- Dependencies: 214
-- Name: client_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_client_id_seq', 1, false);


--
-- TOC entry 4532 (class 0 OID 0)
-- Dependencies: 219
-- Name: client_payment_client_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_payment_client_seq', 1, false);


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 217
-- Name: client_payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_payment_payment_id_seq', 1, false);


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 218
-- Name: client_payment_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_payment_user_seq', 1, false);


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 220
-- Name: client_payment_work_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_payment_work_seq', 1, false);


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 215
-- Name: client_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.client_user_seq', 1, false);


--
-- TOC entry 4537 (class 0 OID 0)
-- Dependencies: 222
-- Name: color_color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.color_color_id_seq', 1, false);


--
-- TOC entry 4538 (class 0 OID 0)
-- Dependencies: 225
-- Name: created_item_color_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.created_item_color_seq', 1, false);


--
-- TOC entry 4539 (class 0 OID 0)
-- Dependencies: 224
-- Name: created_item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.created_item_item_id_seq', 1, false);


--
-- TOC entry 4540 (class 0 OID 0)
-- Dependencies: 226
-- Name: created_item_object_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.created_item_object_seq', 1, false);


--
-- TOC entry 4541 (class 0 OID 0)
-- Dependencies: 231
-- Name: object_client_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.object_client_seq', 1, false);


--
-- TOC entry 4542 (class 0 OID 0)
-- Dependencies: 228
-- Name: object_object_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.object_object_id_seq', 1, false);


--
-- TOC entry 4543 (class 0 OID 0)
-- Dependencies: 232
-- Name: object_used_script_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.object_used_script_seq', 1, false);


--
-- TOC entry 4544 (class 0 OID 0)
-- Dependencies: 230
-- Name: object_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.object_user_seq', 1, false);


--
-- TOC entry 4545 (class 0 OID 0)
-- Dependencies: 229
-- Name: object_work_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.object_work_seq', 1, false);


--
-- TOC entry 4546 (class 0 OID 0)
-- Dependencies: 237
-- Name: script_item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.script_item_item_id_seq', 1, false);


--
-- TOC entry 4547 (class 0 OID 0)
-- Dependencies: 238
-- Name: script_item_script_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.script_item_script_id_seq', 1, false);


--
-- TOC entry 4548 (class 0 OID 0)
-- Dependencies: 234
-- Name: script_script_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.script_script_id_seq', 1, false);


--
-- TOC entry 4549 (class 0 OID 0)
-- Dependencies: 235
-- Name: script_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.script_user_seq', 1, false);


--
-- TOC entry 4550 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.user_payment_payment_id_seq', 1, false);


--
-- TOC entry 4551 (class 0 OID 0)
-- Dependencies: 243
-- Name: user_payment_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.user_payment_user_seq', 1, false);


--
-- TOC entry 4552 (class 0 OID 0)
-- Dependencies: 240
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.users_user_id_seq', 6, true);


--
-- TOC entry 4553 (class 0 OID 0)
-- Dependencies: 247
-- Name: work_client_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.work_client_seq', 1, false);


--
-- TOC entry 4554 (class 0 OID 0)
-- Dependencies: 246
-- Name: work_user_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.work_user_seq', 1, false);


--
-- TOC entry 4555 (class 0 OID 0)
-- Dependencies: 245
-- Name: work_work_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.work_work_id_seq', 1, false);


--
-- TOC entry 4294 (class 2606 OID 17643)
-- Name: client_payment client_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment
    ADD CONSTRAINT client_payment_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4292 (class 2606 OID 17630)
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4296 (class 2606 OID 17652)
-- Name: color color_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.color
    ADD CONSTRAINT color_pkey PRIMARY KEY (color_id);


--
-- TOC entry 4298 (class 2606 OID 17665)
-- Name: created_item created_item_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.created_item
    ADD CONSTRAINT created_item_pkey PRIMARY KEY (item_id);


--
-- TOC entry 4300 (class 2606 OID 17682)
-- Name: object object_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT object_pkey PRIMARY KEY (object_id);


--
-- TOC entry 4304 (class 2606 OID 17704)
-- Name: script_item script_item_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script_item
    ADD CONSTRAINT script_item_pkey PRIMARY KEY (item_id);


--
-- TOC entry 4302 (class 2606 OID 17693)
-- Name: script script_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script
    ADD CONSTRAINT script_pkey PRIMARY KEY (script_id);


--
-- TOC entry 4308 (class 2606 OID 17722)
-- Name: user_payment user_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.user_payment
    ADD CONSTRAINT user_payment_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4306 (class 2606 OID 17713)
-- Name: users user_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4310 (class 2606 OID 17735)
-- Name: work work_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work
    ADD CONSTRAINT work_pkey PRIMARY KEY (work_id);


--
-- TOC entry 4312 (class 2606 OID 17741)
-- Name: client_payment client; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment
    ADD CONSTRAINT client FOREIGN KEY (client) REFERENCES public.client(client_id) NOT VALID;


--
-- TOC entry 4316 (class 2606 OID 17761)
-- Name: object client; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT client FOREIGN KEY (client) REFERENCES public.client(client_id) NOT VALID;


--
-- TOC entry 4322 (class 2606 OID 17791)
-- Name: work client; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work
    ADD CONSTRAINT client FOREIGN KEY (client) REFERENCES public.client(client_id) NOT VALID;


--
-- TOC entry 4315 (class 2606 OID 17756)
-- Name: created_item object; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.created_item
    ADD CONSTRAINT object FOREIGN KEY (object) REFERENCES public.object(object_id) NOT VALID;


--
-- TOC entry 4320 (class 2606 OID 17781)
-- Name: script_item script; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.script_item
    ADD CONSTRAINT script FOREIGN KEY (script_id) REFERENCES public.script(script_id) NOT VALID;


--
-- TOC entry 4317 (class 2606 OID 17766)
-- Name: object used_script; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT used_script FOREIGN KEY (used_script) REFERENCES public.script(script_id) NOT VALID;


--
-- TOC entry 4311 (class 2606 OID 17736)
-- Name: client user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT "user" FOREIGN KEY ("user") REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 4313 (class 2606 OID 17746)
-- Name: client_payment user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment
    ADD CONSTRAINT "user" FOREIGN KEY ("user") REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 4318 (class 2606 OID 17771)
-- Name: object user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT "user" FOREIGN KEY ("user") REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 4321 (class 2606 OID 17786)
-- Name: user_payment user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.user_payment
    ADD CONSTRAINT "user" FOREIGN KEY ("user") REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 4323 (class 2606 OID 17796)
-- Name: work user; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.work
    ADD CONSTRAINT "user" FOREIGN KEY ("user") REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 4314 (class 2606 OID 17751)
-- Name: client_payment work; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.client_payment
    ADD CONSTRAINT work FOREIGN KEY (work) REFERENCES public.work(work_id) NOT VALID;


--
-- TOC entry 4319 (class 2606 OID 17776)
-- Name: object work; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT work FOREIGN KEY (work) REFERENCES public.work(work_id) NOT VALID;


-- Completed on 2024-05-23 11:36:45

--
-- PostgreSQL database dump complete
--

