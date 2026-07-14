import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors, radius, shadow, spacing } from "./theme";

export function Screen({ children }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>{children}</ScrollView>;
}

export function BrandHeader({ t, language, setLanguage, mode, setMode }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandKanji}>匠</Text></View>
        <View>
          <Text style={styles.brandTitle}>Takumi Concierge</Text>
          <Text style={styles.brandPlace}>{t("brandPlace")}</Text>
        </View>
      </View>
      <View style={styles.switchRow}>
        {["ja", "en", "zh"].map((key) => (
          <Pressable
            key={key}
            style={[styles.smallChip, language === key && styles.smallChipActive]}
            onPress={() => setLanguage(key)}
          >
            <Text style={[styles.smallChipText, language === key && styles.smallChipTextActive]}>{key === "ja" ? "JP" : key.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.modeSwitch}>
        <Pressable style={[styles.modeButton, mode === "customer" && styles.modeActive]} onPress={() => setMode("customer")}>
          <Text style={[styles.modeText, mode === "customer" && styles.modeTextActive]}>{t("customer")}</Text>
        </Pressable>
        <Pressable style={[styles.modeButton, mode === "pro" && styles.modeActive]} onPress={() => setMode("pro")}>
          <Text style={[styles.modeText, mode === "pro" && styles.modeTextActive]}>{t("pro")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function HeroCard({ image, title, lead, children }) {
  return (
    <View style={styles.heroCard}>
      <Image source={image} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <Text style={styles.kicker}>TAKUMI KOMUTEN</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroLead}>{lead}</Text>
        {children}
      </View>
    </View>
  );
}

export function Section({ eyebrow, title, children, dark = false }) {
  return (
    <View style={[styles.section, dark && styles.sectionDark]}>
      {eyebrow ? <Text style={[styles.eyebrow, dark && styles.textLight]}>{eyebrow}</Text> : null}
      {title ? <Text style={[styles.sectionTitle, dark && styles.textLight]}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function StatGrid({ stats }) {
  return (
    <View style={styles.statGrid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.statCard}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ActionButton({ label, onPress, variant = "solid" }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        variant === "ghost" && styles.actionButtonGhost,
        variant === "lightGhost" && styles.actionButtonLightGhost
      ]}
    >
      <Text
        style={[
          styles.actionText,
          variant === "ghost" && styles.actionTextGhost,
          variant === "lightGhost" && styles.actionTextLightGhost
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({ tabs, active, setActive }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={[styles.tab, active === tab.key && styles.tabActive]} onPress={() => setActive(tab.key)}>
          <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function OptionRow({ options, value, onChange }) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => (
        <Pressable key={option.value} style={[styles.option, value === option.value && styles.optionActive]} onPress={() => onChange(option.value)}>
          <Text style={[styles.optionText, value === option.value && styles.optionTextActive]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Stepper({ label, value, unit, onMinus, onPlus }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepButton} onPress={onMinus}><Text style={styles.stepButtonText}>-</Text></Pressable>
        <Text style={styles.stepValue}>{value} {unit}</Text>
        <Pressable style={styles.stepButton} onPress={onPlus}><Text style={styles.stepButtonText}>+</Text></Pressable>
      </View>
    </View>
  );
}

export function Field({ label, value, onChangeText, placeholder, multiline = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(32,33,31,0.42)"
        multiline={multiline}
      />
    </View>
  );
}

export function ImageStory({ item }) {
  return (
    <View style={styles.imageStory}>
      <Image source={item.image} style={styles.storyImage} />
      <View style={styles.storyCaption}>
        <Text style={styles.storyTag}>{item.tag}</Text>
        <Text style={styles.storyTitle}>{item.title}</Text>
      </View>
    </View>
  );
}

export function EmptyNotice({ text }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sumi
  },
  screenContent: {
    padding: spacing.md,
    paddingBottom: 120
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.sumi2,
    borderColor: "rgba(247,242,232,0.58)",
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  brandKanji: {
    color: colors.paper,
    fontSize: 24,
    fontWeight: "700"
  },
  brandTitle: {
    color: colors.paper,
    fontSize: 17,
    fontWeight: "900"
  },
  brandPlace: {
    color: "rgba(247,242,232,0.62)",
    fontSize: 12,
    fontWeight: "700"
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  smallChip: {
    borderColor: "rgba(247,242,232,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  smallChipActive: {
    backgroundColor: colors.paper
  },
  smallChipText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: "900"
  },
  smallChipTextActive: {
    color: colors.sumi
  },
  modeSwitch: {
    backgroundColor: "rgba(247,242,232,0.07)",
    borderColor: "rgba(247,242,232,0.18)",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4
  },
  modeButton: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    paddingVertical: 12
  },
  modeActive: {
    backgroundColor: colors.paper
  },
  modeText: {
    color: "rgba(247,242,232,0.72)",
    fontWeight: "900"
  },
  modeTextActive: {
    color: colors.sumi
  },
  heroCard: {
    borderColor: "rgba(247,242,232,0.18)",
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 430,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...shadow
  },
  heroImage: {
    height: "100%",
    position: "absolute",
    width: "100%"
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,17,16,0.48)"
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg
  },
  kicker: {
    color: colors.aqua,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  heroTitle: {
    color: colors.paper,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    marginTop: spacing.sm
  },
  heroLead: {
    color: "rgba(247,242,232,0.78)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm
  },
  section: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.md
  },
  sectionDark: {
    backgroundColor: colors.sumi2,
    borderColor: "rgba(247,242,232,0.12)",
    borderWidth: 1
  },
  eyebrow: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
    marginBottom: spacing.md
  },
  textLight: {
    color: colors.paper
  },
  statGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  statCard: {
    backgroundColor: "rgba(13,17,16,0.7)",
    borderColor: "rgba(247,242,232,0.14)",
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.sm
  },
  statValue: {
    color: colors.copper,
    fontSize: 22,
    fontWeight: "900"
  },
  statLabel: {
    color: "rgba(247,242,232,0.76)",
    fontSize: 11,
    fontWeight: "800"
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.sumi,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  actionButtonGhost: {
    backgroundColor: "transparent",
    borderColor: "rgba(13,17,16,0.18)",
    borderWidth: 1
  },
  actionButtonLightGhost: {
    backgroundColor: "rgba(247,242,232,0.08)",
    borderColor: "rgba(247,242,232,0.34)",
    borderWidth: 1
  },
  actionText: {
    color: colors.paper,
    fontWeight: "900"
  },
  actionTextGhost: {
    color: colors.sumi
  },
  actionTextLightGhost: {
    color: colors.paper
  },
  tabBar: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  tab: {
    borderColor: "rgba(247,242,232,0.22)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  tabActive: {
    backgroundColor: colors.paper
  },
  tabText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.sumi
  },
  optionRow: {
    gap: spacing.sm
  },
  option: {
    borderColor: "rgba(32,33,31,0.14)",
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.md
  },
  optionActive: {
    backgroundColor: colors.sumi,
    borderColor: colors.sumi
  },
  optionText: {
    color: colors.ink,
    fontWeight: "900"
  },
  optionTextActive: {
    color: colors.paper
  },
  stepper: {
    marginTop: spacing.md
  },
  inputLabel: {
    color: "rgba(32,33,31,0.66)",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  stepButton: {
    alignItems: "center",
    backgroundColor: colors.sumi,
    borderRadius: radius.sm,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  stepButtonText: {
    color: colors.paper,
    fontSize: 22,
    fontWeight: "900"
  },
  stepValue: {
    color: colors.ink,
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  field: {
    marginBottom: spacing.md
  },
  textInput: {
    backgroundColor: colors.white,
    borderColor: "rgba(32,33,31,0.16)",
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.ink,
    padding: spacing.md
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  imageStory: {
    backgroundColor: colors.sumi2,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: "hidden"
  },
  storyImage: {
    height: 190,
    width: "100%"
  },
  storyCaption: {
    padding: spacing.md
  },
  storyTag: {
    color: colors.aqua,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  storyTitle: {
    color: colors.paper,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4
  },
  notice: {
    backgroundColor: "rgba(79,108,89,0.13)",
    borderColor: "rgba(79,108,89,0.28)",
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md
  },
  noticeText: {
    color: colors.ink,
    fontWeight: "800",
    lineHeight: 20
  }
});
