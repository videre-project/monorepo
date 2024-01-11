/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Url } from "url";


export default interface Env {
	PGHOST: Url;
	PGDATABASE: String;
	PGUSER: String;
	PGPASSWORD: String;
}
