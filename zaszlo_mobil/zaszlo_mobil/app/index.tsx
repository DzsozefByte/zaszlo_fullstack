import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewProgressEvent,
} from "react-native-webview/lib/WebViewTypes";

const DEFAULT_WEB_URL =
  Platform.OS === "android" ? "http://10.0.2.2:5173" : "http://localhost:5173";

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
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
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
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          disabled={!canGoBack}
          onPress={() => webViewRef.current?.goBack()}
          style={[styles.toolbarButton, !canGoBack && styles.toolbarButtonDisabled]}
        >
          <Text style={styles.toolbarButtonText}>Vissza</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={handleGoHome} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>Fooldal</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>Ujratoltes</Text>
        </Pressable>
      </View>

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
        </>
      )}

      {errorMessage ? (
        <View style={styles.errorOverlay}>
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
  toolbar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d8dfea",
  },
  toolbarButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f4c81",
    borderRadius: 8,
    paddingVertical: 10,
  },
  toolbarButtonDisabled: {
    backgroundColor: "#a9bdd1",
  },
  toolbarButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
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
    bottom: 24,
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
