SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict lQe6GdPyszRnRaQkGn1xmb6KakgvQcz6YbFyqA1OuwXLbkzgWcAsoIhYeunHE19

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: daisha_masters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."daisha_masters" ("id", "car_name", "number_plate", "body_color", "size_type", "status", "inspection_date", "last_oil_change_date", "has_etc", "created_at", "note") FROM stdin;
0e92c36f-930e-4995-925c-ba53d3047277	ライズ	6090	ベージュ	普通車	貸出可	2029-05-26	2026-08-08	f	2026-08-08 07:30:11.617673+00	\N
b1e77d52-65e0-456d-96ef-92235a4d59d9	ライズ	6091	パール	普通車	貸出可	2029-05-26	2026-08-08	f	2026-08-08 07:30:48.033453+00	\N
1c6f4b76-dea0-4418-bec8-29d3961902ee	ライズ	7214	グレー	普通車	貸出可	2029-06-30	2026-08-08	f	2026-08-08 07:31:34.016024+00	\N
950aeea1-64f9-4dd4-807a-db8380260ea8	N-BOXカスタム	7991	パール	軽自動車	貸出可	2026-02-09	2026-07-30	t	2026-07-30 07:38:40.017727+00	\N
9ab35f9a-a8d0-48a0-a628-af01ce0ce42d	N-BOXカスタム	1215	黒	軽自動車	貸出可	2026-11-30	2026-07-30	f	2026-07-30 07:39:44.361757+00	\N
768a9fc2-32e1-4185-8c57-81a0e5c36f48	N-BOXカスタム	3400	パール	軽自動車	貸出可	2026-12-19	2026-07-30	f	2026-07-30 07:41:00.437019+00	\N
8e82b868-0d3f-47d3-a88e-a6f82fff3c00	スペーシアカスタム	433	パール	軽自動車	貸出可	2026-12-26	2026-07-30	f	2026-07-30 07:42:01.843021+00	\N
428e5cad-7603-4fcc-b25d-85c0cd9f3b38	スペーシアカスタム	634	パール	軽自動車	貸出可	2028-11-19	2026-07-30	f	2026-07-30 07:46:23.720643+00	\N
0d79a725-dba5-4e21-85fe-f8914c3f6306	スペーシアカスタム	637	黒	軽自動車	貸出可	2028-11-19	2026-07-30	f	2026-07-30 07:48:50.474828+00	\N
150335df-2f22-4c39-af58-a7ca2fb4e892	スペーシアカスタム	636	黒	軽自動車	貸出可	2028-11-19	2026-07-30	f	2026-07-30 07:49:53.128116+00	\N
8a7a687a-31be-48b9-b94b-ecd685986b5e	スペーシアカスタム	632	パール	軽自動車	貸出可	2028-11-19	2026-07-30	f	2026-07-30 07:50:39.253724+00	\N
7956bdf2-c701-482f-84b1-44cce46d4de8	スペーシアカスタム	631	パール	軽自動車	貸出可	2028-11-19	2026-07-30	f	2026-07-30 07:51:51.143466+00	\N
5c00b1b2-c6b4-48f1-94d1-35c5cc7be943	ハスラー	2801	青	軽自動車	貸出可	2027-12-22	2026-07-30	f	2026-07-30 07:52:48.931159+00	\N
6e7e199d-ed0d-4286-94b8-071f4b935fa9	デリカミニ	552	緑	軽自動車	貸出可	2028-07-22	2026-07-30	t	2026-07-30 07:53:34.163335+00	\N
5a6c7b58-c054-4b73-b463-9ce9c987bd67	デリカミニ	554	黒	軽自動車	貸出可	2028-07-22	2026-07-30	t	2026-07-30 07:54:20.256888+00	\N
987b484f-c00d-4d75-b165-34626f26e02b	デリカミニ	557	アイボリー	軽自動車	貸出可	2028-07-22	2026-07-30	t	2026-07-30 07:55:54.617939+00	\N
f419378d-aa74-4636-a951-8ca9ddce6f9a	デリカミニ	9808	緑	軽自動車	貸出可	2028-07-13	2026-07-30	t	2026-07-30 07:56:35.500259+00	\N
5dbe3491-c5a6-43ab-92fd-7857344b0a32	デリカミニ	9832	黒	軽自動車	貸出可	2028-07-13	2026-07-30	t	2026-07-30 07:57:42.661156+00	\N
c79fd5af-75f6-46d9-aecc-1d5b45e13762	ヴェゼル	1356	パール	普通車	貸出可	2028-12-03	2026-07-30	f	2026-07-30 08:02:14.261315+00	\N
2aeec9b3-e02d-4e54-b8f1-c161ce78db7a	test	1111		軽自動車	非稼働	2026-08-06	2026-08-08	f	2026-08-08 07:12:48.366257+00	\N
5ddca709-7d91-47a8-9608-4df2dbf3e31e	WR-V	3483	パール	普通車	貸出可	2027-06-12	2026-08-08	f	2026-08-08 07:15:39.789953+00	\N
3ebf8a48-8a6f-4cdd-a93f-7d6dd6d8db64	WR-V	826	黒	普通車	貸出可	2027-04-14	2026-08-08	f	2026-08-08 07:16:46.610789+00	\N
d240877f-913f-4deb-bc56-007bf933db84	WR-V	6283	パール	普通車	貸出可	2027-08-01	2026-08-08	f	2026-08-08 07:18:03.988955+00	\N
606e7a93-933a-4cd9-b832-764a2f07b29b	WR-V	6841	パール	普通車	貸出可	2028-02-24	2026-08-08	f	2026-08-08 07:18:47.481047+00	\N
0d7ce30b-2aa8-4b1a-b949-047e70cda82c	WR-V	1344	黒	普通車	貸出可	2028-12-02	2026-08-08	f	2026-08-08 07:19:50.928863+00	\N
162c4427-bc57-4721-87c9-b745f2022447	ライズ	9208	パール	普通車	貸出可	2026-12-21	2026-08-08	t	2026-08-08 07:21:10.463854+00	\N
b9ef89d5-9259-4012-9298-2ff37f644994	ライズ	9209	黒	普通車	貸出可	2026-12-21	2026-08-08	t	2026-08-08 07:22:08.123218+00	\N
7f5cf744-a289-446c-a17b-94fbae852f8b	ライズ	1361	ベージュ	普通車	貸出可	2028-01-29	2026-08-08	f	2026-08-08 07:22:46.489185+00	\N
c348c579-0864-4ca2-9c16-5f997c96bee3	ライズ	1362	ベージュ	普通車	貸出可	2028-01-29	2026-08-08	f	2026-08-08 07:23:28.796856+00	\N
4c92accb-9028-451b-bf61-cf6459c18bd8	ライズ	1363	ベージュ	普通車	貸出可	2028-01-29	2026-08-08	f	2026-08-08 07:24:25.4426+00	\N
0fac6c0c-189a-4b8d-b173-2fdfeedce7a3	ライズ	1364	パール	普通車	貸出可	2028-01-29	2026-08-08	f	2026-08-08 07:25:44.879853+00	\N
ca0ce888-b728-4b00-a921-9e5b7f9e58c2	ライズ	1365	パール	普通車	貸出可	2028-01-29	2026-08-08	f	2026-08-08 07:26:48.562457+00	\N
be619ecd-f4d3-437a-ba64-7e4c63ae8e91	ライズ	512	黒	普通車	貸出可	2028-11-26	2026-08-08	f	2026-08-08 07:27:28.626678+00	\N
946b0b77-88ec-4b0d-8821-b825000cc469	ライズ	2177	ベージュ	普通車	貸出可	2029-01-26	2026-08-08	f	2026-08-08 07:27:58.224829+00	\N
e372526c-0f39-4ae2-a925-f06cf95f444d	ライズ	2178	黒	普通車	貸出可	2029-01-26	2026-08-08	f	2026-08-08 07:28:27.421072+00	\N
06de19ed-720f-45cb-9fe0-39cd1c9a9515	ライズ	9602	パール	普通車	貸出可	2028-10-27	2026-08-08	f	2026-08-08 07:29:09.576116+00	\N
91941de6-9ed2-49b3-816f-c6735edb1cce	ライズ	7218	グレー	普通車	貸出可	2029-06-30	2026-08-08	f	2026-08-08 07:32:17.233841+00	\N
c68eca54-46f7-4150-9353-7af6486c7405	クロスビー	1260	ブルー	普通車	貸出可	2028-12-21	2026-08-08	f	2026-08-08 07:32:46.583144+00	\N
5928c8c0-710f-41ae-ac55-db0ba52ad319	クロスビー	1261	ブルー	普通車	貸出可	2028-12-21	2026-08-08	f	2026-08-08 07:33:21.610421+00	\N
60e41b42-a0c8-4c7b-b969-79464242c6bf	クロスビー	1262	アイボリー	普通車	貸出可	2028-12-21	2026-08-08	f	2026-08-08 07:33:58.089801+00	\N
094742e7-f6a8-47d8-af53-f5e296f8999c	カローラアクシオ	4054	ブロンズ	普通車	貸出可	2027-05-30	2026-08-08	f	2026-08-08 07:35:02.187814+00	\N
1b65f38c-dac3-4ac5-87ab-6d525fcbb36f	カローラアクシオ	4566	ブロンズ	普通車	貸出可	2027-06-18	2026-08-08	f	2026-08-08 07:35:52.65229+00	\N
67f18157-50e4-46bd-9fcb-1b4af819a9c1	カローラアクシオ	4567	ブロンズ	普通車	貸出可	2027-06-18	2026-08-08	f	2026-08-08 07:36:36.324776+00	\N
0a4fc2e3-f341-4a51-b7d8-6055a06b50e7	カローラアクシオ	4568	ブロンズ	普通車	貸出可	2027-06-18	2026-08-08	f	2026-08-08 07:37:36.29661+00	\N
8df5a307-b527-471e-beca-f9cda055894e	カローラアクシオ	4569	ブロンズ	普通車	貸出可	2027-06-18	2026-08-08	f	2026-08-08 07:38:23.071286+00	\N
b741afc2-fee0-4b0c-a9ec-f428c06b5f9d	ノート	572	グレー	普通車	貸出可	2028-02-01	2026-08-08	f	2026-08-08 07:39:05.963121+00	\N
b14a547c-d4cf-4680-88b5-6dd327c014ee	エッセ	6972	黄	軽自動車	貸出可	2027-03-03	2026-08-08	f	2026-08-08 07:40:03.571876+00	\N
a52c698d-c958-4f59-a09e-e982b857e4c0	タント	1110	白	軽自動車	貸出可	2028-02-04	2026-08-08	f	2026-08-08 07:40:46.812605+00	\N
f3660d50-f1a3-4d43-a0a3-5b680a89ce84	N-BOXカスタム(社用車)	5568	グレー	軽自動車	貸出可	2027-01-23	2026-08-08	f	2026-08-08 07:41:32.973423+00	\N
\.


--
-- Data for Name: daisha_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."daisha_reservations" ("id", "car_id", "start_at", "end_at", "customer_name", "car_type", "purpose", "staff_name", "status", "note", "created_at", "size_limit") FROM stdin;
46db8504-9963-4b96-affc-1c330770e308	f3660d50-f1a3-4d43-a0a3-5b680a89ce84	2026-08-10 00:00:00+00	2026-08-12 09:00:00+00	難波	アクア	車検	難波	キャンセル	あわわ	2026-08-10 06:04:37.855594+00	軽自動車
63d10e29-18da-4cd8-83bf-11530de9ec4c	428e5cad-7603-4fcc-b25d-85c0cd9f3b38	2026-08-29 00:00:00+00	2026-08-31 09:00:00+00	テスト	プリウス	車検	テスト	確定	\N	2026-08-29 02:56:19.485157+00	限定なし
d594546f-1875-4068-99fa-0409fa76b07d	8e82b868-0d3f-47d3-a88e-a6f82fff3c00	2026-09-02 01:00:00+00	2026-09-04 09:00:00+00	山崎	N-ONE	車検	谷本	確定	\N	2026-08-09 06:18:38.830935+00	軽自動車
0d610d70-a974-46bb-be28-e2b66e2b6c6c	768a9fc2-32e1-4185-8c57-81a0e5c36f48	2026-09-30 00:00:00+00	2026-09-30 09:00:00+00	テスト	テスト	修理・整備	テスト	キャンセル	\N	2026-09-10 07:32:34.361973+00	軽自動車
107f540b-2c9a-43e4-91bd-7cc3c7f7da40	ca0ce888-b728-4b00-a921-9e5b7f9e58c2	2026-08-09 00:00:00+00	2026-08-09 09:00:00+00	岡崎	ﾊｲｴｰｽ	商談・試乗	岡崎	キャンセル	\N	2026-08-09 08:04:19.843928+00	普通車
709168e2-ddf0-4fd9-8356-f592039d30b9	162c4427-bc57-4721-87c9-b745f2022447	2026-08-09 00:00:00+00	2026-08-19 23:00:00+00	AAA	AAA	車検	AAA	確定	\N	2026-08-09 09:19:45.771049+00	普通車
a3b3a6d6-01f1-4ab4-b046-5fe57d48f761	a52c698d-c958-4f59-a09e-e982b857e4c0	2026-09-17 00:00:00+00	2026-09-17 09:00:00+00	テスト		車検	テスト	キャンセル	\N	2026-09-10 07:34:04.023457+00	軽自動車
5b8adb4b-1087-4808-bf98-14e77b532c12	428e5cad-7603-4fcc-b25d-85c0cd9f3b38	2026-08-08 00:00:00+00	2026-08-12 09:00:00+00	test		車検	test	キャンセル	\N	2026-08-08 06:40:57.152359+00	軽自動車
587dcb21-1bdd-476a-b210-b7dd14c9c79f	\N	2026-08-08 00:00:00+00	2026-08-08 09:00:00+00	test		車検	tets	キャンセル	\N	2026-08-08 07:14:25.298394+00	限定なし
9a5779ec-245c-4615-9457-5c464a8380f9	\N	2026-08-06 00:00:00+00	2026-08-06 09:00:00+00	test		車検	test	キャンセル	\N	2026-08-06 09:14:01.550694+00	限定なし
ac67d933-0b7a-4a15-bafa-eb51a20afc99	7956bdf2-c701-482f-84b1-44cce46d4de8	2026-08-10 00:00:00+00	2026-08-10 09:00:00+00	テスト	プリウス	商談・試乗	テスト	確定	テストA	2026-08-10 01:52:13.928971+00	軽自動車
c52212aa-cc99-44f3-9d10-30f189e737ee	768a9fc2-32e1-4185-8c57-81a0e5c36f48	2026-09-14 00:00:00+00	2026-09-21 09:00:00+00	テスト		車検	テスト	キャンセル	\N	2026-09-12 07:59:20.694104+00	限定なし
ddb639cd-52b8-4f03-8fdf-6927559c5f97	\N	2026-08-09 00:00:00+00	2026-08-20 09:00:00+00	岡崎	ハイエース	商談・試乗	岡崎	キャンセル	\N	2026-08-09 08:07:19.350269+00	限定なし
f8ee152d-7a25-4eae-acce-1be12437b919	950aeea1-64f9-4dd4-807a-db8380260ea8	2026-08-07 00:00:00+00	2026-08-10 09:00:00+00	坂口		車検	坂口	キャンセル	\N	2026-08-07 04:51:25.93076+00	限定なし
93c24b2b-20a4-48e1-a040-718148bdc087	7956bdf2-c701-482f-84b1-44cce46d4de8	2026-09-13 00:00:00+00	2026-09-23 09:00:00+00	テスト		車検	テスト	確定	\N	2026-09-12 09:23:04.822611+00	軽自動車
92ca4498-988a-4890-ab16-def6c1e48443	428e5cad-7603-4fcc-b25d-85c0cd9f3b38	2026-09-14 00:00:00+00	2026-09-20 09:00:00+00	テスト		修理・整備	テスト	確定	\N	2026-09-12 09:23:45.636309+00	軽自動車
0977583b-f588-45b9-8be3-0344bdfae238	0d79a725-dba5-4e21-85fe-f8914c3f6306	2026-09-12 00:00:00+00	2026-09-22 09:00:00+00	テスト		車検	テスト	確定	\N	2026-09-12 09:29:28.259929+00	軽自動車
cc392a67-ffd3-45bc-a99b-d7dc16237c0a	950aeea1-64f9-4dd4-807a-db8380260ea8	2026-08-17 04:00:00+00	2026-08-21 09:00:00+00	坂口	RAV4	修理・整備	森岡	確定	\N	2026-08-10 05:44:25.030208+00	軽自動車
bdd14038-646f-4415-9205-d74bccc09c88	4c92accb-9028-451b-bf61-cf6459c18bd8	2026-09-13 00:00:00+00	2026-09-13 09:00:00+00	あああ		車検	あああ	確定	\N	2026-09-12 09:31:11.278112+00	普通車
cb1fe75a-0781-4ff0-ba42-9e1993bb44eb	6e7e199d-ed0d-4286-94b8-071f4b935fa9	2026-09-12 00:00:00+00	2026-09-12 09:00:00+00	あああー		車検	あああ	キャンセル	\N	2026-09-12 09:31:56.886699+00	軽自動車
c6ccd610-1268-40a2-9c56-8713f015d6da	6e7e199d-ed0d-4286-94b8-071f4b935fa9	2026-09-13 00:00:00+00	2026-09-13 09:00:00+00	ああああ		車検	ああああ	確定	\N	2026-09-12 09:32:20.967403+00	限定なし
dfef57cd-9973-4c6d-a33e-048b11638573	0d79a725-dba5-4e21-85fe-f8914c3f6306	2026-08-10 00:00:00+00	2026-08-10 09:00:00+00	テスト		修理・整備	テスト	確定	\N	2026-08-10 05:52:22.192391+00	軽自動車
\.


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."parking_slots" ("id", "label", "car_name", "color", "status", "plate", "car_manager", "entry_manager", "entry_date", "memo", "editing_id", "locked_at", "customer_name", "last_ping", "area_name", "is_battery_dead") FROM stdin;
38	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
67	T-2	BRZ　MT車	パール	売約済(小売)	有	谷本 貢一	森岡 央行	2026/8/22 10:00		\N	\N	市原様	\N	タワー	f
85	T-20	BMW	シルバー		有	松浦 広司				\N	\N		\N	タワー	f
47	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
49	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
52	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
53	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
57	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
62	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
63	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
83	T-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
54	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
68	T-3	プロボックス	白	整備預かり	有	岡本 慎平	岡本 慎平	2026/9/11 10:50		\N	\N	翔建設	\N	タワー	f
2	縦	ライズ1363	ベージュ	代車	有	岡﨑 有功	上山 紀昭	2026/9/12 17:36		\N	\N		\N	裏駐車場	f
304	予備2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
64	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
87	T-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
20	東-4	トール	パール	整備預かり	有	岡本 慎平	岡本 慎平	2026/8/7 10:07	事故現状、自走可	\N	\N	田中	\N	裏駐車場	f
29	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
28	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
44	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
37	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
246	東1-2	キャスト	白	在庫	有					\N	\N		\N	極上仕上場	f
74	T-9	GT-R34 Nur	白	在庫	有	亀島 大夢	中村 俊也		出す時みんなで確認!!!!	user-tm0tczb4c	\N		2026-09-02 08:41:00.955+00	タワー	f
91	T-26	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
251	東2-3	S660		在庫	有					\N	\N		\N	極上仕上場	f
294	ポート10	パレット	白	AA行き	有					\N	\N		\N	極上仕上場	f
257	東4-1	ノマド	カーキ	在庫	有					\N	\N		\N	極上仕上場	f
71	T-6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
259	東4-3	ジムニー	黒	在庫	有	谷本 貢一				\N	\N		\N	極上仕上場	f
256	東3-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
66	T-1	BMW	黒	整備預かり	有	岡本 慎平	岡本 慎平			\N	\N	村田様	\N	タワー	f
42	縦	\N	\N	\N	\N	\N	\N	\N	\N	user-vx8jka2hh	\N	\N	2026-08-31 00:55:22.387+00	裏駐車場	f
253	東3-1	ノマド	ベージュ	在庫	有					\N	\N		\N	極上仕上場	f
55	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
75	T-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
92	T-27	アクシオ4568	ブロンズ	代車	有	岡﨑 有功	安達 未来	2026/8/31 17:59		user-tm0tczb4c	\N		2026-09-02 08:51:50.897+00	タワー	f
81	T-16	アクア	白	売約済(小売)	有	岡﨑 有功	亀島 大夢		岡﨑副社長と亀島さん対応	\N	\N	渡邉様	\N	タワー	f
293	ポート9	サンバーT	シルバー	AA行き	有					\N	\N		\N	極上仕上場	f
48	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
15	東-3	UX	白	売約済(小売)	有	朝栄 拓海	朝栄 拓海	2026/9/11 15:47		\N	\N	守田様	\N	裏駐車場	f
88	T-23	アクア	黒	整備預かり	有	森岡 央行	平井 旭	2026/9/2 13:28		\N	\N	山口様	\N	タワー	f
59	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
7	縦	ライズ6091	パール	代車	有	岡﨑 有功	亀島 大夢			\N	\N		\N	裏駐車場	f
247	東1-3	N-BOX	白	在庫	有		朝栄 拓海			\N	\N		\N	極上仕上場	f
69	T-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
43	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
80	T-15	アクア1782	黒	レンタカー	有		岡本 慎平	2026/8/29 10:22	スカイレンタ	\N	\N		\N	タワー	f
31	西-7	ルーミー	白	売約済(小売)	有	朝栄 拓海	谷本 貢一	2026/9/6 17:34		\N	\N	遠藤様	\N	裏駐車場	f
72	T-7	ソアラエアロキャビン	パール2	在庫	有	松浦 広司	松浦 広司		380	\N	\N		\N	タワー	f
248	東1-4	\N	\N	\N	\N	\N	\N	\N	\N	user-a75ubtojw	\N	\N	2026-08-07 08:02:02.997+00	極上仕上場	f
27	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
65	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
12	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
252	東2-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
19	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
56	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
32	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
36	西-8	クロスビー1261	紺	代車	有	岡﨑 有功	上山 紀昭	2026/9/5 17:01		\N	\N		\N	裏駐車場	f
58	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
30	東-6	ハイゼットカーゴ	白		有	藤井 武司	上山 紀昭	2026/8/1 17:34		\N	\N	裏在庫	\N	裏駐車場	f
76	T-11	ヴィッツ	茶	AA行き	有	岡本 慎平	田中 美夕日	2026/9/6 17:30		\N	\N		\N	タワー	f
33	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
60	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
39	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
250	東2-2	NBOX	黒	在庫	有					\N	\N		\N	極上仕上場	f
245	東1-1	ハリアー	黒	在庫	有					\N	\N		\N	極上仕上場	f
255	東3-3	N-VAN	白	在庫	有					\N	\N		\N	極上仕上場	f
8	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
50	東-10	社員駐			有					\N	\N		\N	裏駐車場	f
16	西-4	キャンバス	ベージュ	売約済(小売)	無	藤井 武司	平井 旭	2026/9/3 17:15		\N	\N	鵜瀬	\N	裏駐車場	f
51	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
61	社員駐	社員駐			有					\N	\N		\N	裏駐車場	f
45	東-9	ヴェゼル	黒	AA行き	有	藤井 武司	岡﨑 有功	2026/9/4 10:50		\N	\N	急発進の恐れあり、動かさないで下さい	\N	裏駐車場	f
25	東-5	ジムニー	黒	整備預かり	有	朝栄 拓海	上山 紀昭	2026/9/11 17:55		\N	\N	青木	\N	裏駐車場	f
295	ポート11	ハイエース	白	AA行き	有					\N	\N		\N	極上仕上場	f
261	東5-1	ノマド	白	在庫	有					\N	\N		\N	極上仕上場	f
292	ポート8	プジョー	黒	AA行き	有					\N	\N		\N	極上仕上場	f
271	東7-3	ハイエース	白	在庫	有					\N	\N		\N	極上仕上場	f
288	ポート4	ヤリスクロス（相場あたため中…）	黒	AA行き	有	藤井 武司				\N	\N		\N	極上仕上場	f
1	西-1	CX3	ガンメタ	AA行き	有	谷本 貢一	上山 紀昭	2026/9/11 17:54		\N	\N		\N	裏駐車場	f
6	西-2	ノマド	ベージュ	在庫	有	岡﨑 有功	上山 紀昭	2026/7/11 17:48		\N	\N		\N	裏駐車場	f
260	東4-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
40	東-8	プリウス	黒	AA行き	有	岡本 慎平	上山 紀昭	2026/9/12 17:36		\N	\N		\N	裏駐車場	f
84	T-19	ジャガーXK120	緑	在庫	有	岡﨑 有功	中村 俊也		1300	\N	\N		\N	タワー	f
273	東8-1	ハイエース	白	在庫	有					\N	\N		\N	極上仕上場	f
93	T-28	セリカ	白	売約済(小売)	無	亀島 大夢	中村 俊也	2026/9/11 9:36		\N	\N	田中	\N	タワー	f
267	東6-3	ヴェルファイア	白	在庫	有					\N	\N		\N	極上仕上場	f
264	東5-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
283	西7	キックス	オレンジ	AA行き	有					\N	\N		\N	極上仕上場	f
285	ポート1	BMW	白	在庫	有					\N	\N		\N	極上仕上場	f
275	東8-3	ルークス	紫	在庫	有					\N	\N		\N	極上仕上場	f
284	西8	アトレー（裏在庫）	茶色	在庫	有	岡本 慎平	朝栄 拓海	2026/8/2 18:26		\N	\N		\N	極上仕上場	f
300	スタジオ4	ラングラー	緑	在庫	有					\N	\N		\N	極上仕上場	f
24	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
278	西2	ミニキャブ 裏在庫	白		有					\N	\N		\N	極上仕上場	f
18	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
78	T-13	ポルシェ930ターボ	赤	在庫	有	松浦 広司	藤田 陸			\N	\N		\N	タワー	f
270	東7-2	ヴァルファイア	黒	在庫	有					\N	\N		\N	極上仕上場	f
22	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
263	東5-3	マツダ3	シルバー	在庫	有					\N	\N		\N	極上仕上場	f
298	スタジオ2	BMW	黒	在庫	有					\N	\N		\N	極上仕上場	f
262	東5-2	ハリアー	黒	在庫	無					\N	\N		\N	極上仕上場	f
303	予備1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
4	縦	アルファード	黒	整備預かり	有	森岡 央行	安達 未来			\N	\N	三瀬	\N	裏駐車場	f
282	西6	アクティ（裏在庫）	白	在庫	有	上山 紀昭	朝栄 拓海			\N	\N		\N	極上仕上場	f
10	東-2	ヤリクロ	白	売約済(小売)	有	亀島 大夢	上山 紀昭	2026/8/30 17:42		\N	\N	志賀	\N	裏駐車場	t
310	予備8	\N	\N	\N	\N	\N	\N	\N	\N	user-zzy4hz7np	\N	\N	2026-05-31 00:47:46.489+00	極上仕上場	f
290	ポート6	ライズ	久保	AA行き	有					\N	\N		\N	極上仕上場	f
299	スタジオ3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
277	西1	ハリアー	黒	AA行き	有					\N	\N		\N	極上仕上場	f
269	東7-1	ジムニー	グレー	在庫	有			2026/8/20 17:44		\N	\N		\N	極上仕上場	f
287	ポート3	ダイナ	白	AA行き	有	谷本 貢一	谷本 貢一	2026/6/24 15:35		\N	\N		\N	極上仕上場	f
14	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
23	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
306	予備4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
272	東7-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
249	東2-1	ハリアー	黒	在庫	有					\N	\N		\N	極上仕上場	f
266	東6-2	オデッセイ	黒	在庫	有	藤井 武司	藤井 武司	2026/6/25 17:37		\N	\N		\N	極上仕上場	f
5	東-1	ZRV		その他	無	岡﨑 有功			動きます	\N	\N	合田	\N	裏駐車場	f
34	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
11	西-3	ライズ8641	白	代車	有	岡﨑 有功	上山 紀昭	2026/9/10 17:53		\N	\N		\N	裏駐車場	f
302	掃除スペース2	ハリアー	黒	在庫	有					\N	\N		\N	極上仕上場	f
281	西5	デイズ	白	AA行き	有	岡本 慎平				\N	\N		\N	極上仕上場	f
82	T-17	ケンメリ GT	白	在庫	有	松浦 広司	藤田 陸		650	\N	\N		\N	タワー	f
286	ポート2	マセラティ	白	AA行き	有					\N	\N		\N	極上仕上場	f
274	東8-2	アルファード	白	在庫	有					\N	\N		\N	極上仕上場	f
305	予備3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
268	東6-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
265	東6-1	ジムニー	白	在庫	有					\N	\N		\N	極上仕上場	f
276	東8-4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
77	T-12	Z	黒		有				会長の車？	\N	\N		\N	タワー	f
296	ポート12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
297	スタジオ1	レヴォーグ	白	在庫	有					\N	\N		\N	極上仕上場	f
301	掃除スペース1	スペーシア	白	在庫	有					\N	\N		\N	極上仕上場	f
307	予備5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
308	予備6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
309	予備7	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	極上仕上場	f
254	東3-2	タント	白	在庫	有					\N	\N		\N	極上仕上場	f
86	T-21	GT-R34	青	在庫	有	岡﨑 有功	藤田 陸		車高・幅ギリギリ	\N	\N		\N	タワー	f
9	縦	フォレスター	白	売約済(小売)	有	藤井 武司	上山 紀昭	2026/9/4 17:21		\N	\N	吉川	\N	裏駐車場	f
79	T-14	プリウス	黒	在庫	有	藤井 武司	藤井 武司	2026/9/12 17:39		\N	\N	合木様	\N	タワー	f
94	T-29	アクシオ4566	ブロンズ	代車	有	岡﨑 有功	岡本 慎平	2026/8/30 16:52		\N	\N		\N	タワー	f
21	西-5	ノマド	パール	売約済(小売)	有	藤井 武司	岡本 慎平	2026/9/11 10:45		\N	\N	石原	\N	裏駐車場	f
13	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
280	西4	NVAN	白	在庫	無		朝栄 拓海	2026/8/2 18:25		\N	\N		\N	極上仕上場	f
46	西-10	社員駐			有					\N	\N		\N	裏駐車場	f
90	T-25	SAI	白	車検預かり	有	岸戸 彪我	岡本 慎平	2026/9/12 9:48		\N	\N	見村	\N	タワー	f
289	ポート5	パレット	白	AA行き	有	藤井 武司				\N	\N		\N	極上仕上場	f
73	T-8	スープラGT-A	黒	在庫	有	松浦 広司	岸戸 彪我			\N	\N		\N	タワー	f
26	西-6	タント	白	整備預かり	有	岡本 慎平	上山 紀昭	2026/8/31 17:34		\N	\N	中武	\N	裏駐車場	f
41	西-9	デリカミニ9808	緑	代車	有	岡﨑 有功	上山 紀昭	2026/9/10 17:29		\N	\N		\N	裏駐車場	f
70	T-5	ウェストフィールド（鍵無）	緑	AA行き	無	藤井 武司	中村 俊也	2026/5/30 10:26	鍵がない車です。	\N	\N		\N	タワー	f
291	ポート7	ハリアー	黒	AA行き	有	藤井 武司	藤井 武司			\N	\N		\N	極上仕上場	f
258	東4-2	ヴェルファイア	黒	在庫	無					\N	\N		\N	極上仕上場	f
35	東-7	ライズ7218　※マット装着&出すとき保険かける！	グレー	代車	有	岡﨑 有功	上山 紀昭	2026/7/17 17:07		\N	\N		\N	裏駐車場	f
279	西3	エスクァイア（ﾘｱ事故だけど小売用裏在庫）	白	在庫	有		藤井 武司	2026/8/2 18:26		\N	\N		\N	極上仕上場	f
89	T-24	プリウス	白	AA行き	有	谷本 貢一	藤井 武司	2026/9/10 17:38		\N	\N		\N	タワー	f
3	縦	ヴェゼル	パール	売約済(小売)	無	岡本 慎平	岡本 慎平	2026/9/11 10:36		\N	\N	森江	\N	裏駐車場	f
95	T-30	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	タワー	f
17	縦	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	裏駐車場	f
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: parking_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."parking_slots_id_seq"', 310, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict lQe6GdPyszRnRaQkGn1xmb6KakgvQcz6YbFyqA1OuwXLbkzgWcAsoIhYeunHE19

RESET ALL;
