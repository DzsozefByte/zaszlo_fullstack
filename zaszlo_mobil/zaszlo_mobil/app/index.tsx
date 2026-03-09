import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewProgressEvent,
} from "react-native-webview/lib/WebViewTypes";

const DEFAULT_WEB_URL =
  Platform.OS === "android" ? "http://10.0.2.2:5173" : "http://localhost:5173";

type BottomAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const configuredWebUrl = normalizeUrl(process.env.EXPO_PUBLIC_WEBAPP_URL ?? "");
  const resolvedUrl = configuredWebUrl || DEFAULT_WEB_URL;
  const isFallbackUrl = !configuredWebUrl;

  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [sourceUri, setSourceUri] = useState(resolvedUrl);
  const [webViewKey, setWebViewKey] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialUri = useMemo(() => resolvedUrl, [resolvedUrl]);
  const bottomSpace = 126 + insets.bottom;

  const handleNavigationChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleProgress = useCallback((event: WebViewProgressEvent) => {
    setLoadProgress(event.nativeEvent.progress);
  }, []);

  const handleError = useCallback((event: WebViewErrorEvent) => {
    setErrorMessage(
      event.nativeEvent.description || "A weboldal nem erheto el. Ellenorizd a szervert es az URL-t."
    );
  }, []);

  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    setSourceUri(initialUri);
    setWebViewKey((prev) => prev + 1);
  }, [initialUri]);

  const handleGoHome = useCallback(() => {
    setErrorMessage(null);
    setSourceUri(initialUri);
    setWebViewKey((prev) => prev + 1);
  }, [initialUri]);

  const handleOpenRoute = useCallback(
    (routePath: string) => {
      setErrorMessage(null);
      try {
        setSourceUri(new URL(routePath, initialUri).toString());
      } catch {
        const normalizedBase = initialUri.endsWith("/") ? initialUri.slice(0, -1) : initialUri;
        const normalizedPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
        setSourceUri(`${normalizedBase}${normalizedPath}`);
      }
    },
    [initialUri]
  );

  const openInBrowser = useCallback(async () => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(sourceUri, "_blank", "noopener,noreferrer");
        return;
      }
      await Linking.openURL(sourceUri);
    } catch {
      setErrorMessage("Nem sikerult megnyitni a megadott URL-t.");
    }
  }, [sourceUri]);

  const bottomActions = useMemo<BottomAction[]>(
    () => [
      {
        key: "back",
        label: "Vissza",
        icon: "arrow-back-outline",
        onPress: () => webViewRef.current?.goBack(),
        disabled: !canGoBack,
      },
      {
        key: "home",
        label: "Fooldal",
        icon: "home-outline",
        onPress: handleGoHome,
      },
      {
        key: "refresh",
        label: "Frissit",
        icon: "refresh-outline",
        onPress: handleRetry,
      },
      {
        key: "products",
        label: "Termekek",
        icon: "grid-outline",
        onPress: () => handleOpenRoute("/kereso"),
      },
      {
        key: "cart",
        label: "Kosar",
        icon: "cart-outline",
        onPress: () => handleOpenRoute("/kosar"),
      },
      {
        key: "profile",
        label: "Profil",
        icon: "person-circle-outline",
        onPress: () => handleOpenRoute("/profil"),
      },
      {
        key: "checkout",
        label: "Fizetes",
        icon: "card-outline",
        onPress: () => handleOpenRoute("/fizetes"),
      },
    ],
    [canGoBack, handleGoHome, handleRetry, handleOpenRoute]
  );

  useEffect(() => {
    if (Platform.OS !== "android") {
      return undefined;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  if (!sourceUri) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Hianyzo webes URL</Text>
          <Text style={styles.errorText}>
            Allitsd be az `EXPO_PUBLIC_WEBAPP_URL` valtozot (pl. `http://192.168.1.25:5173`).
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {isFallbackUrl ? (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>
            Nincs `EXPO_PUBLIC_WEBAPP_URL` beallitva. Telefonon ez a fallback URL valoszinuleg nem fog mukodni.
          </Text>
        </View>
      ) : null}

      {Platform.OS === "web" ? (
        <View style={styles.webFallback}>
          <Text style={styles.errorTitle}>Webes elo-nezet mod</Text>
          <Text style={styles.errorText}>
            A `react-native-webview` web platformon nem tamogatott. Expo Go-ban (Android/iOS) futtasd, vagy nyisd
            meg kulon a webappot.
          </Text>
          <Pressable accessibilityRole="button" onPress={openInBrowser} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Webapp megnyitasa</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.webArea, { paddingBottom: bottomSpace }]}>
            {loadProgress > 0 && loadProgress < 1 ? (
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.round(loadProgress * 100)}%` }]} />
              </View>
            ) : null}

            <WebView
              key={webViewKey}
              ref={webViewRef}
              source={{ uri: sourceUri }}
              originWhitelist={["http://*", "https://*"]}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              domStorageEnabled
              javaScriptEnabled
              allowsBackForwardNavigationGestures
              setSupportMultipleWindows={false}
              pullToRefreshEnabled
              onError={handleError}
              onLoadStart={() => setErrorMessage(null)}
              onLoadProgress={handleProgress}
              onNavigationStateChange={handleNavigationChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#0f4c81" />
                  <Text style={styles.loaderText}>Betoltes...</Text>
                </View>
              )}
              style={styles.webView}
            />
          </View>

          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <View style={styles.bottomBarGrid}>
              {bottomActions.map((item) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  disabled={item.disabled}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.bottomActionButton,
                    item.disabled && styles.bottomActionButtonDisabled,
                    pressed && !item.disabled && styles.bottomActionButtonPressed,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={item.disabled ? "#a6b0be" : "#0f4c81"}
                    style={styles.bottomActionIcon}
                  />
                  <Text style={[styles.bottomActionText, item.disabled && styles.bottomActionTextDisabled]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      )}

      {errorMessage ? (
        <View style={[styles.errorOverlay, { bottom: Platform.OS === "web" ? 24 : bottomSpace + 8 }]}>
          <Text style={styles.errorTitle}>Betoltesi hiba</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Ujraprobalas</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
  },
  noticeBar: {
    backgroundColor: "#fff4db",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0d58a",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noticeText: {
    fontSize: 12,
    color: "#6f5300",
    textAlign: "center",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  webArea: {
    flex: 1,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: "#d8dfea",
  },
  progressBarFill: {
    height: 3,
    backgroundColor: "#0f4c81",
  },
  webView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d7deea",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  bottomBarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  bottomActionButton: {
    minHeight: 44,
    width: "23.5%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f3f7fc",
    borderWidth: 1,
    borderColor: "#d5e2f3",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  bottomActionButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  bottomActionButtonDisabled: {
    backgroundColor: "#f7f8fb",
    borderColor: "#e4e7ee",
  },
  bottomActionIcon: {
    marginBottom: 1,
  },
  bottomActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#133a62",
  },
  bottomActionTextDisabled: {
    color: "#a6b0be",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loaderText: {
    marginTop: 10,
    color: "#425466",
    fontSize: 14,
  },
  errorOverlay: {
    position: "absolute",
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffd4d4",
    elevation: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#932f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#4a4a4a",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#0f4c81",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
