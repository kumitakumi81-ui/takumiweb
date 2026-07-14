import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ActionButton,
  EmptyNotice,
  Field,
  HeroCard,
  ImageStory,
  OptionRow,
  Screen,
  Section,
  StatGrid,
  Stepper
} from "../components";
import { customerWorks, images } from "../data";
import { colors, radius, spacing } from "../theme";

export function CustomerExperience({ t, activeTab }) {
  if (activeTab === "estimate") return <EstimateScreen t={t} />;
  if (activeTab === "works") return <WorksScreen t={t} />;
  if (activeTab === "consult") return <ConsultScreen t={t} />;
  if (activeTab === "progress") return <ProgressScreen t={t} />;
  return <CustomerHome t={t} />;
}

function CustomerHome({ t }) {
  return (
    <Screen>
      <HeroCard image={images.hero} title={t("heroTitle")} lead={t("heroLead")}>
        <View style={styles.heroActions}>
          <ActionButton label={t("quickEstimate")} />
          <ActionButton label={t("sendPhoto")} variant="lightGhost" />
        </View>
      </HeroCard>
      <StatGrid
        stats={[
          { value: "1987", label: t("trusted") },
          { value: "15+", label: t("published") },
          { value: "KIX", label: t("gateway") }
        ]}
      />
      <Section title={t("worksTitle")} dark>
        {customerWorks.slice(0, 2).map((item) => <ImageStory key={item.id} item={item} />)}
      </Section>
      <Section title={t("consultTitle")}>
        <Text style={styles.bodyText}>{t("consultLead")}</Text>
        <ActionButton label={t("bookVisit")} />
      </Section>
    </Screen>
  );
}

function EstimateScreen({ t }) {
  const [type, setType] = useState("new");
  const [finish, setFinish] = useState("essential");
  const [area, setArea] = useState(120);

  const estimate = useMemo(() => {
    const baseRates = { new: 240000, renovation: 80000, commercial: 130000 };
    const fixedCosts = { new: 2800000, renovation: 800000, commercial: 1000000 };
    const finishFactors = { essential: 0.78, balanced: 0.92, premium: 1.08 };
    const midpoint = area * baseRates[type] * finishFactors[finish] + fixedCosts[type];
    const lower = Math.round((midpoint * 0.82) / 1000000);
    const upper = Math.round((midpoint * 0.98) / 1000000);
    return `¥${lower}M - ¥${upper}M`;
  }, [area, finish, type]);

  return (
    <Screen>
      <Section eyebrow={t("estimate")} title={t("estimateTitle")}>
        <Text style={styles.bodyText}>{t("estimateLead")}</Text>
        <Text style={styles.groupLabel}>{t("projectType")}</Text>
        <OptionRow
          value={type}
          onChange={setType}
          options={[
            { value: "new", label: t("newHome") },
            { value: "renovation", label: t("renovation") },
            { value: "commercial", label: t("commercial") }
          ]}
        />
        <Stepper
          label={t("floorArea")}
          value={area}
          unit="m2"
          onMinus={() => setArea(Math.max(40, area - 10))}
          onPlus={() => setArea(Math.min(240, area + 10))}
        />
        <Text style={styles.groupLabel}>{t("finish")}</Text>
        <OptionRow
          value={finish}
          onChange={setFinish}
          options={[
            { value: "essential", label: t("essential") },
            { value: "balanced", label: t("balanced") },
            { value: "premium", label: t("premium") }
          ]}
        />
      </Section>
      <View style={styles.estimateResult}>
        <Text style={styles.resultLabel}>{t("starterRange")}</Text>
        <Text style={styles.resultValue}>{estimate}</Text>
        <ActionButton label={t("useForInquiry")} />
      </View>
    </Screen>
  );
}

function ConsultScreen({ t }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Screen>
      <Section eyebrow={t("consult")} title={t("consultTitle")}>
        <Text style={styles.bodyText}>{t("consultLead")}</Text>
        <Field label={t("name")} value={name} onChangeText={setName} />
        <Field label={t("contact")} value={contact} onChangeText={setContact} />
        <Field label={t("message")} value={message} onChangeText={setMessage} multiline />
        <ActionButton label={t("saveDraft")} onPress={() => setSaved(true)} />
        {saved ? <View style={styles.saved}><Text style={styles.savedText}>{t("draftSaved")}</Text></View> : null}
      </Section>
      <Section title={t("sendPhoto")} dark>
        <ImageStory item={{ id: "photo", title: t("sendPhoto"), tag: "PHOTO", image: images.beforeAfter }} />
      </Section>
    </Screen>
  );
}

function WorksScreen({ t }) {
  return (
    <Screen>
      <Section eyebrow={t("works")} title={t("worksTitle")} dark>
        {customerWorks.map((item) => <ImageStory key={item.id} item={item} />)}
      </Section>
      <Section title="Takumi Visual Campaign">
        <ImageStory item={{ id: "poster", title: "Master Builders of Japan", tag: "Brand", image: images.poster }} />
      </Section>
    </Screen>
  );
}

function ProgressScreen({ t }) {
  return (
    <Screen>
      <Section eyebrow={t("progress")} title={t("progressTitle")}>
        <Text style={styles.bodyText}>{t("progressLead")}</Text>
        <View style={styles.timeline}>
          {["Consultation", "Estimate", "Plan", "Construction", "Handover"].map((step, index) => (
            <View key={step} style={styles.timelineRow}>
              <View style={[styles.timelineDot, index < 2 && styles.timelineDotActive]} />
              <View style={styles.timelineCard}>
                <Text style={styles.timelineStep}>{step}</Text>
                <Text style={styles.timelineText}>{index < 2 ? "Complete" : "Coming next"}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>
      <EmptyNotice text={t("nextStepBody")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroActions: {
    marginTop: spacing.md
  },
  bodyText: {
    color: "rgba(32,33,31,0.72)",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: spacing.md
  },
  groupLabel: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: "uppercase"
  },
  estimateResult: {
    backgroundColor: colors.sumi2,
    borderColor: "rgba(247,242,232,0.16)",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  resultLabel: {
    color: colors.aqua,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  resultValue: {
    color: colors.paper,
    fontSize: 40,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  saved: {
    backgroundColor: "rgba(79,108,89,0.14)",
    borderRadius: radius.md,
    marginTop: spacing.md,
    padding: spacing.md
  },
  savedText: {
    color: colors.moss,
    fontWeight: "900"
  },
  timeline: {
    gap: spacing.sm
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timelineDot: {
    backgroundColor: colors.paper2,
    borderRadius: 999,
    height: 16,
    marginTop: 16,
    width: 16
  },
  timelineDotActive: {
    backgroundColor: colors.cinnabar
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderColor: "rgba(32,33,31,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md
  },
  timelineStep: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  timelineText: {
    color: "rgba(32,33,31,0.58)",
    fontWeight: "700",
    marginTop: 4
  }
});
