### Write a very simple webhook broker service:
User will be registering webhooks on system and service will be responsible for delivering them. Thrid Party services will leverage to perform action or write their own bussiness logic to do something in case of event. Webhooks are very convenient as it works over HTTP instead of message brokers. Different thrid party service may use different message broker so comming to aggrement is a huge issue.

### Functional Requirements:
-  Register new webhooks
-  Exactly once delivery garranty
-  Retry on failure with exponential Backoff

### API Endpoints:
- POST /api/v0/webhooks
- GET /api/v0/webhooks?page_size=`<page-size>`&offset=`<offset>`
- GET /api/v0/webhooks/`<event-name>`
- POST /api/v0/trigger-event/`<event-name>`

### User flow:

`POST /api/v0/webhooks` to register webhook on a eventName. Multiple webhooks could be registered for a event.
```json
{
	"eventName": "uploadedImage",
	"webhookUrl": "https://eocwrsoyaqdawk4.m.pipedream.net"
}
```

```json
{
	"eventName": "uploadedImage",
	"webhookUrl": "https://another.m.pipedream.net"
}
```

Now fetching webhooks with `GET /api/v0/webhooks` should return following
```json
[
	{ 
		"eventName": "uploadImage",
		"webhookUrls": [
				"https://eocwrsoyaqdawk4.m.pipedream.net",
				"https://another.m.pipedream.net",
			]
	}
]
```

Now fetching information about single webhooks using `GET /api/v0/webhooks/upload-image` should return following,

```json
{ 
	"eventName": "uploadImage",
	"webhookUrls": [
			"https://eocwrsoyaqdawk4.m.pipedream.net",
			"https://another.m.pipedream.net",
		]
}
```

Now triggering webhooks event via `POST /api/v0/trigger-event/<event-name>` should call all of registered webhooks with  .
```json
{
  "id": "123456",
  "url": "https://example.com/images/sample.jpg",
  "name": "sample_image",
  "description": "A sample image for demonstration purposes",
  "tags": ["sample", "image", "demo"],
  "metadata": {
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "format": "jpeg",
    "size_in_bytes": 204800,
    "created_at": "2024-12-23T12:00:00Z",
    "updated_at": "2024-12-23T12:00:00Z"
  },
  "related_entities": {
    "album_id": "7890",
    "user_id": "user_456"
  },
  "is_public": true
}
```

Now webhook broker should call `POST https://eocwrsoyaqdawk4.m.pipedream.net` and `POST https://another.m.pipedream.net` api with following data.

### Tech Stack:
- NodeJS
- Typescript
- RabbitMq
- Docker

### Acceptance Criteria:
- A docker compose file to setup all of the service.
- Github/GitLab repo containing the code.

### Bonus Problem:
- How to prevent DDOS on user webhooks, May be they only want to recieve events only from specic webhook broker?

