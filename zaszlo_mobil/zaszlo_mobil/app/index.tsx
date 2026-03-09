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

const MOBILE_WEBVIEW_TWEAKS = `
  (function () {
    var styleId = "zaszlo-mobile-webview-style";
    var routeHooksReady = false;
    var firstScrollDone = false;
    var lastScrolledPath = "";
    var autoScrollPrefixes = ["/", "/kereso", "/termek", "/kosar", "/profil", "/szamlak", "/fizetes", "/login", "/register"];
    var css = [
      "html, body, #root { max-width: 100vw !important; overflow-x: hidden !important; }",
      "body { overflow-x: hidden !important; }",
      "* { box-sizing: border-box !important; }",
      ".navbar .navbar-nav.me-auto { display: none !important; }",
      ".user-pill .d-none.d-sm-block { display: block !important; max-width: 88px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }",
      ".container, .container-fluid, .row, [class*='col-'] { max-width: 100% !important; }",
      ".row { margin-left: 0 !important; margin-right: 0 !important; }",
      ".table-responsive { overflow-x: visible !important; }",
      "table { width: 100% !important; table-layout: fixed !important; }",
      "th, td { white-space: normal !important; word-break: break-word !important; font-size: 0.78rem !important; padding: 0.4rem !important; }",
      ".mini-cart-panel { width: min(92vw, 320px) !important; max-width: min(92vw, 320px) !important; right: 0 !important; left: auto !important; }",
      ".mini-cart-panel .list-group-item { padding-left: 0.6rem !important; padding-right: 0.6rem !important; }",
      ".termek-page { background: #f4f7fb !important; }",
      ".termek-page .termek-layout { margin-top: 0.6rem !important; row-gap: 0.9rem !important; }",
      ".termek-page .termek-media-card { min-height: 230px !important; padding: 1.05rem !important; border-radius: 16px !important; }",
      ".termek-page .termek-image { max-height: 185px !important; width: auto !important; }",
      ".termek-page .termek-illustration-badge { padding: 0.5rem !important; }",
      ".termek-page .termek-title { font-size: clamp(1.35rem, 6vw, 1.8rem) !important; line-height: 1.15 !important; margin-bottom: 0.8rem !important; }",
      ".termek-page .termek-config-card { border-radius: 16px !important; padding: 0.95rem !important; box-shadow: 0 8px 22px rgba(15,76,129,0.08) !important; }",
      ".termek-page .termek-config-card h4 { font-size: 1.02rem !important; margin-bottom: 0.85rem !important; }",
      ".termek-page .termek-size-select { height: 46px !important; font-size: 0.95rem !important; }",
      ".termek-page .termek-materials { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem !important; }",
      ".termek-page .termek-material-btn { width: 100% !important; min-height: 40px !important; border-radius: 10px !important; font-size: 0.9rem !important; }",
      ".termek-page .termek-price-row { margin-bottom: 0.75rem !important; padding: 0.7rem !important; border: 1px solid #e2e9f3 !important; border-radius: 12px !important; background: #f8fbff !important; }",
      ".termek-page .termek-price { font-size: clamp(1.35rem, 6.2vw, 1.85rem) !important; line-height: 1.05 !important; }",
      ".termek-page .termek-add-btn { min-height: 50px !important; padding-top: 0.65rem !important; padding-bottom: 0.65rem !important; font-size: 1rem !important; }",
      ".termek-page .termek-benefits { display: grid !important; grid-template-columns: 1fr !important; gap: 0.4rem !important; margin-top: 0.1rem !important; }",
      ".termek-page .termek-benefit-item { padding: 0.45rem 0.55rem !important; border-radius: 10px !important; background: #eef5fc !important; border: 1px solid #dfebf8 !important; }",
      "@media (max-width: 991.98px) {",
      "  .navbar .navbar-toggler { display: none !important; }",
      "  .navbar .navbar-collapse { display: block !important; visibility: visible !important; height: auto !important; }",
      "  .termek-page .breadcrumb { display: none !important; }",
      "  .termek-page .termek-layout > .termek-media-col { order: 1; }",
      "  .termek-page .termek-layout > .termek-config-col { order: 2; }",
      "}"
    ].join("");

    var applyStyle = function () {
      var existing = document.getElementById(styleId);
      if (!existing) {
        var style = document.createElement("style");
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
      }
    };

    var applyState = function () {
      var navContent = document.getElementById("navContent");
      if (navContent) {
        navContent.classList.add("show");
      }
    };

    var shouldAutoScroll = function (pathname) {
      return autoScrollPrefixes.some(function (prefix) {
        return prefix === "/" ? pathname === "/" : pathname === prefix || pathname.indexOf(prefix + "/") === 0;
      });
    };

    var scrollToTopIfNeeded = function (force) {
      var pathname = (window.location && window.location.pathname) || "/";
      if (!shouldAutoScroll(pathname)) {
        return;
      }
      if (!force && pathname === lastScrolledPath) {
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      var root = document.getElementById("root");
      if (root) {
        root.scrollTop = 0;
      }

      lastScrolledPath = pathname;
    };

    var ensureRouteHooks = function () {
      if (routeHooksReady) {
        return;
      }
      routeHooksReady = true;

      var scheduleScroll = function (force) {
        setTimeout(function () {
          scrollToTopIfNeeded(force);
        }, 0);
      };

      window.addEventListener("popstate", function () {
        scheduleScroll(false);
      });

      window.addEventListener("hashchange", function () {
        scheduleScroll(false);
      });

      var originalPushState = history.pushState;
      history.pushState = function () {
        originalPushState.apply(this, arguments);
        scheduleScroll(false);
      };

      var originalReplaceState = history.replaceState;
      history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        scheduleScroll(false);
      };
    };

    var applyTweaks = function () {
      applyStyle();
      applyState();
      ensureRouteHooks();
      if (!firstScrollDone) {
        firstScrollDone = true;
        scrollToTopIfNeeded(true);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyTweaks, { once: true });
    } else {
      applyTweaks();
    }

    var observer = new MutationObserver(function () {
      applyTweaks();
    });

    var target = document.documentElement || document.body;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    }
  })();
  true;
`;

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
  const bottomBarHeight = 78 + Math.max(insets.bottom, 10);

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
        key: "home",
        label: "Fooldal",
        icon: "home-outline",
        onPress: handleGoHome,
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
        key: "back",
        label: "Vissza",
        icon: "arrow-back-outline",
        onPress: () => webViewRef.current?.goBack(),
        disabled: !canGoBack,
      },
      {
        key: "refresh",
        label: "Frissit",
        icon: "refresh-outline",
        onPress: handleRetry,
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
          <View style={styles.webArea}>
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
              injectedJavaScriptBeforeContentLoaded={MOBILE_WEBVIEW_TWEAKS}
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
            <View style={styles.bottomBarList}>
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
        <View style={[styles.errorOverlay, { bottom: Platform.OS === "web" ? 24 : bottomBarHeight + 8 }]}>
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
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d7deea",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  bottomBarList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomActionButton: {
    minHeight: 48,
    width: "16.1%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#f3f7fc",
    borderWidth: 1,
    borderColor: "#d5e2f3",
    paddingVertical: 3,
    paddingHorizontal: 1,
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
    fontSize: 9,
    fontWeight: "700",
    color: "#133a62",
    marginTop: 1,
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
