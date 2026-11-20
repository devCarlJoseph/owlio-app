# Classroom and locker file integration

Implemented in source on 20 November 2026. Requires the matching API release, migration 0053 (applied to the explicitly approved local API database target), API S3_* credentials, and bucket CORS. A separate live R2 synthetic file probe passed signed upload, byte verification, final write and signed inline download; test objects were removed. Browser OPTIONS preflight now passes for both configured origins after the user corrected CORS. After the user corrected the active key pair, the real R2Storage adapter passed signed upload, staging read and byte verification, final write, and signed inline viewing; actual PUT/GET responses accepted both configured origins. All synthetic objects were removed. No browser/classroom/locker persistence check has passed yet.

- Classroom Materials lets the teacher add PDF/PNG/JPEG files up to 5 MB and lets the teacher/current enrolled students view or download ready files. Existing shared resource links remain visible.
- Draft Classwork has a Classwork attachments section using existing classwork uploads. Attachments become learner-visible after publication. Publishing is disabled during an active attachment operation. Student submission-file flows are unchanged.
- Account Study Spaces open My locker with server-backed owner-only file storage. Reloading lists saved API metadata; other members cannot list, view, rename, or remove those files. Local locker codes do not authorize account file access.
- Device-only rooms retain their original device drawer. Previous device files remain accessible from account lockers through an explicit device-file link. Nothing is silently uploaded or deleted.
- Files appear only after transfer and finalization succeed. Completion failures retain a retry action and reuse the upload reservation/bytes. Read failures are not displayed as empty lists. Each view obtains a fresh short-lived signed URL for viewing/download, without storing it in browser records. Rename preserves the accepted file type; removal waits for API confirmation.

The shared PrivateFileManager composes project-owned controls and the typed private-files service. API cookies/CSRF stay with the API client. Storage receives a direct signed PUT with credentials omitted. The bucket stays private; signed downloads support inline PDF/image viewing in a separate tab.

See the companion API's docs/PRIVATE_RESOURCE_FILES.md and docs/r2-cors.json for release prerequisites, lifecycle/retention behavior, endpoint contracts, and the exact allowed origins http://localhost:5173 and https://owliohub.vercel.app. Do not place R2 credentials in VITE_* variables. Set credentials in the local API environment and deployed API service, then restart/release those services.

Local mocked service/component/HTTP tests do not establish real database persistence, R2 delivery, deployed authorization, or CORS. Apply/release only through the separately approved target workflow.
