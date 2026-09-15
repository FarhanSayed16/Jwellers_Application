# Android permissions audit (Phase 23)

| Permission | Present? | Justification |
|---|---|---|
| `INTERNET` | Yes | API, images, FCM |
| `POST_NOTIFICATIONS` | Yes | FCM rate/chat/arrival nudges (Android 13+) |
| `CAMERA` | **No** | Gallery/camera pickers deferred; chat/custom requests accept HTTPS URLs only |
| `READ_MEDIA_*` / storage | **No** | Same as above |
| `ACCESS_FINE_LOCATION` | **No** | Not used |
| `RECORD_AUDIO` | **No** | Not used |

When image pickers ship (before Phase 25 dogfood), add only the minimum photo-picker / media permission required by target SDK and update Play Data safety + this doc.

**iOS:** no camera usage string until picker ships.
