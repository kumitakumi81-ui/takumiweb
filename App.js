import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { BrandHeader, TabBar } from "./src/components";
import { createTranslator } from "./src/i18n";
import { CustomerExperience } from "./src/screens/customer";
import { ProExperience } from "./src/screens/pro";
import { colors } from "./src/theme";

export default function App() {
  const [language, setLanguage] = useState("ja");
  const [mode, setMode] = useState("customer");
  const [customerTab, setCustomerTab] = useState("home");
  const [proTab, setProTab] = useState("dashboard");
  const t = useMemo(() => createTranslator(language), [language]);

  const customerTabs = [
    { key: "home", label: t("home") },
    { key: "estimate", label: t("estimate") },
    { key: "works", label: t("works") },
    { key: "consult", label: t("consult") },
    { key: "progress", label: t("progress") }
  ];

  const proTabs = [
    { key: "dashboard", label: t("dashboard") },
    { key: "leads", label: t("leads") },
    { key: "projects", label: t("projects") },
    { key: "campaigns", label: t("campaigns") },
    { key: "analytics", label: t("analytics") }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.appShell}>
        <BrandHeader
          t={t}
          language={language}
          setLanguage={setLanguage}
          mode={mode}
          setMode={setMode}
        />
        <TabBar
          tabs={mode === "customer" ? customerTabs : proTabs}
          active={mode === "customer" ? customerTab : proTab}
          setActive={mode === "customer" ? setCustomerTab : setProTab}
        />
        {mode === "customer" ? (
          <CustomerExperience t={t} activeTab={customerTab} />
        ) : (
          <ProExperience t={t} activeTab={proTab} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.sumi,
    flex: 1
  },
  appShell: {
    backgroundColor: colors.sumi,
    flex: 1,
    paddingHorizontal: 14
  }
});
