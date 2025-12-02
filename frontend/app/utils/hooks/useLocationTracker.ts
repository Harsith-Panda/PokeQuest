import { useEffect, useState, useCallback } from "react";

type Location = { latitude: number; longitude: number };
type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

export function useLocationTracker() {
  const [location, setLocation] = useState<Location | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("unsupported");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // Feature detect Permissions API
    if (typeof navigator !== "undefined" && (navigator as any).permissions?.query) {
      (navigator as any)
        .permissions.query({ name: "geolocation" })
        .then((p: any) => setPermissionState(p.state as PermissionState))
        .catch(() => setPermissionState("unsupported"));
    } else {
      setPermissionState("unsupported");
    }
  }, []);

  const _onSuccess = useCallback((pos: GeolocationPosition) => {
    setErrorCode(null);
    setLocation({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
  }, []);

  const _onError = useCallback((err: GeolocationPositionError) => {
    // Normalize codes to friendly keys
    if (err.code === err.PERMISSION_DENIED) {
      setErrorCode("PERMISSION_DENIED");
      setPermissionState("denied");
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setErrorCode("POSITION_UNAVAILABLE");
    } else if (err.code === err.TIMEOUT) {
      setErrorCode("TIMEOUT");
    } else {
      setErrorCode("UNKNOWN_ERROR");
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorCode("NO_GEO_SUPPORT");
      return;
    }
    const id = navigator.geolocation.watchPosition(_onSuccess, _onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });
    setWatchId(id as unknown as number);
    return () => {
      if (id != null && navigator.geolocation.clearWatch) navigator.geolocation.clearWatch(id);
    };
  }, [_onSuccess, _onError]);

  const requestPermission = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorCode("NO_GEO_SUPPORT");
      return { success: false, code: "NO_GEO_SUPPORT" };
    }

    return new Promise<{ success: boolean; code?: string }>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          _onSuccess(pos);
          resolve({ success: true });
        },
        (err) => {
          _onError(err);
          resolve({ success: false, code: err.code ? String(err.code) : "UNKNOWN" });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, [_onError, _onSuccess]);

  return {
    location,
    permissionState,
    errorCode,
    requestPermission,
  };
}
