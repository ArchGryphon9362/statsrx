# API

---

### `ANY` /ping
Pong

#### Request
parameter|description
:-:|:-:
-|-

#### Response
key|description
:-:|:-:
-|-

### `POST` /api/vms/create-vm

#### Request
parameter|description
-|-
name|Friendly name of the vm
description|Description of the vm

#### Response
key|description
:-:|:-:
-|-

### `GET` /api/vms/get-info

#### Request
parameter|description
:-:|:-:
-|-

#### Response
##### Main Response
key|description
-|-
vms|An array containing `vm` objects

##### VM
key|description
-|-
id|VM Id
name|Friendly name of the vm
description|Description of the vm

### `PATCH` /api/vms/edit-vm

#### Request
parameter|description
-|-
id|Id of the vm you want to change
name|New friendly name (optional)
description|New description (optional)

#### Response
key|description
:-:|:-:
-|-

### `DELETE` /api/vms/delete-vm

#### Request
parameter|description
-|-
id|Id of the vm you want to delete

#### Response
key|description
:-:|:-:
-|-

### `POST` /api/storage/insert

#### Request
parameter|description
-|-
id|Id of the vm you are inserting storage stats for
sb|Free storage in bytes
tb|Total storage in bytes

#### Response
key|description
:-:|:-:
-|-

### `GET` /api/get-latest
Returns latest stats

#### Request
parameter|description
:-:|:-:
-|-

#### Response
##### Main Response
key|description
-|-
values|An array containing `value` objects

##### Value
key|description
-|-
date|ISO-8601 timestamp containing the time and date of the value
vmid|Id of which VM this value belongs to
storagebytes|Free storage in bytes
totalbytes|Total storage in bytes

### `GET` /api/storage/get-vm

#### Request
parameter|description
-|-
id|Id of the vm you want storage stats for
time|Time in hours of most recent information

#### Response
##### Main Response
key|description
-|-
points|An array containing `point` objects

##### Point
key|description
-|-
date|ISO-8601 timestamp containing the time and date of the point
storagebytes|Free storage in bytes
totalbytes|Total storage in bytes