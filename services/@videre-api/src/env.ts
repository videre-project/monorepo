/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Url } from "url";


export default interface Env {
	PGHOST: Url;
	PGDATABASE: String;
	PGUSER: String;
	PGPASSWORD: String;
}
