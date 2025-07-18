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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'erickt23', 'c7df2c70ad39692f50ef93f1ecce4ebc8c00f26736964f8315b56f6ce17e07d319647c3790552facf9843de8a9183918b11018c363b191c12de605e923dbdc2c.3ad0dca46ba5589589e24228e0036212', 'super_admin', 'erick.toussaint23@gmail.com', true, '2025-07-09 19:43:21.263506');
INSERT INTO public.users VALUES (2, 'MEB130801', 'c6d34fff5fb92ce77094eb9fbc43511954cbc138beacbcb50523c4fb7cfeacfe2880195bd6f9fc92a4379bed5d337d09540f695c23cc12d8c509615ac208438a.64a4eb879f2b511227491f97f951a3b0', 'member', 'member1@example.com', true, '2025-07-09 19:43:47.309706');
INSERT INTO public.users VALUES (3, 'MEB110301', 'b996850d20029b45b24e2cc14d5985543996c6280aa21f3138aa7b08adcc726890e0d997a76805907d29344b4b4807e5be4c66b1d86bb67ebb019e8423436c23.ea067b07b94dcf9d7b4e68e617deaafa', 'member', 'member2@example.com', true, '2025-07-09 19:43:47.309706');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.audit_log VALUES (1, 1, 'DELETE', 'photos', 1, NULL, '{"deleted":true}', '2025-07-09 20:48:09.970248');
INSERT INTO public.audit_log VALUES (2, 1, 'DELETE', 'photos', 4, NULL, '{"deleted":true}', '2025-07-09 20:48:20.682335');
INSERT INTO public.audit_log VALUES (3, 1, 'UPDATE', 'members', 2, NULL, '{"isActive":false}', '2025-07-15 20:11:50.992817');
INSERT INTO public.audit_log VALUES (4, 1, 'UPDATE', 'members', 1, NULL, '{"isActive":false}', '2025-07-15 20:11:54.92361');
INSERT INTO public.audit_log VALUES (5, 1, 'DELETE', 'members', 2, '{"id":2,"userId":null,"memberCode":"MEB110301","firstName":"Grace","lastName":"DONGMO WANDJI","dateOfBirth":"2008-03-11","gender":"F","phone":"555-0102","email":"grace@example.com","apartment":null,"buildingNumber":null,"street":"456 Oak Ave","city":"Montreal","province":null,"postalCode":"H1B 1B1","country":"Canada","isActive":false,"createdAt":"2025-07-09T19:43:24.527Z"}', NULL, '2025-07-15 20:12:00.814802');
INSERT INTO public.audit_log VALUES (6, 1, 'DELETE', 'members', 1, '{"id":1,"userId":null,"memberCode":"MEB130801","firstName":"Keza","lastName":"Nyota Toussaint","dateOfBirth":"1985-08-13","gender":"F","phone":"555-0101","email":"keza@example.com","apartment":null,"buildingNumber":null,"street":"123 Main St","city":"Montreal","province":null,"postalCode":"H1A 1A1","country":"Canada","isActive":false,"createdAt":"2025-07-09T19:43:24.527Z"}', NULL, '2025-07-15 20:12:07.863382');


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: forum_categories; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: forum_topics; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: group_memberships; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: photo_albums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.photo_albums VALUES (1, 'Cultes dominicaux', 'Photos des services du dimanche', NULL, 1, '2025-07-09 20:43:00.309569');
INSERT INTO public.photo_albums VALUES (2, 'Événements spéciaux', 'Photos des événements spéciaux de l''église', NULL, 1, '2025-07-09 20:43:00.309569');
INSERT INTO public.photo_albums VALUES (3, 'Activités jeunesse', 'Photos des activités pour les jeunes', NULL, 1, '2025-07-09 20:43:00.309569');


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.photos VALUES (2, 1, 'Prière collective', 'prayer_1.svg', 'IMG_002.jpg', 'Moment de prière en communauté', 'photo', 856000, NULL, '{culte,prière}', 1, '2025-07-09 20:43:10.555982');
INSERT INTO public.photos VALUES (3, 2, 'Baptême de mars', 'baptism_1.svg', 'IMG_003.jpg', 'Cérémonie de baptême', 'photo', 1200000, NULL, '{baptême,cérémonie}', 1, '2025-07-09 20:43:10.555982');


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: resource_reservations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.session VALUES ('JtPI4C9bff7_pE2mS06UeSIQS0nTJztt', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-07-17 12:14:06');


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 6, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.donations_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: forum_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_categories_id_seq', 1, false);


--
-- Name: forum_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_replies_id_seq', 1, false);


--
-- Name: forum_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_topics_id_seq', 1, false);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_memberships_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 2, true);


--
-- Name: photo_albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photo_albums_id_seq', 3, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photos_id_seq', 4, true);


--
-- Name: resource_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resource_reservations_id_seq', 1, false);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resources_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

