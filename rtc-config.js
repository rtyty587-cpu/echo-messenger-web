// Add a production TURN service here. Use short-lived credentials supplied by a
// trusted backend; never ship a permanent TURN secret in an APK or EXE.
export const RTC_CONFIG={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}],iceCandidatePoolSize:2};
