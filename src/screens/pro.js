import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ActionButton,
  EmptyNotice,
  Field,
  HeroCard,
  Screen,
  Section,
  StatGrid
} from "../components";
import { campaignIdeas, images, leads, projects } from "../data";
import { colors, radius, spacing } from "../theme";

export function ProExperience({ t, activeTab }) {
  if (activeTab === "leads") return <LeadScreen t={t} />;
  if (activeTab === "projects") return <ProjectScreen t={t} />;
  if (activeTab === "campaigns") return <CampaignScreen t={t} />;
  if (activeTab === "analytics") return <AnalyticsScreen t={t} />;
  return <DashboardScreen t={t} />;
}

function DashboardScreen({ t }) {
  return (
    <Screen>
      <HeroCard image={images.detail} title={t("proHero")} lead={t("proLead")}>
        <StatGrid
          stats={[
            { value: "8", label: t("todayInquiries") },
            { value: "3", label: t("hotLeads") },
            { value: "12", label: t("openProjects") }
          ]}
        />
      </HeroCard>
      <LeadList title={t("leadBoard")} />
      <ProjectList title={t("projectBoard")} />
    </Screen>
  );
}

function LeadScreen({ t }) {
  return (
    <Screen>
      <LeadList title={t("leadBoard")} expanded />
    </Screen>
  );
}

function ProjectScreen({ t }) {
  return (
    <Screen>
      <ProjectList title={t("projectBoard")} expanded />
    </Screen>
  );
}

function CampaignScreen({ t }) {
  const [message, setMessage] = useState(
    "Osaka custom home consultation is open this month. Send photos or floor area for a starter estimate."
  );

  return (
    <Screen>
      <Section eyebrow={t("campaigns")} title={t("campaignTitle")}>
        <Text style={styles.bodyText}>{t("campaignLead")}</Text>
        <Field label={t("campaignMessage")} value={message} onChangeText={setMessage} multiline />
        <View style={styles.ideaList}>
          {campaignIdeas.map((idea) => <Text key={idea} style={styles.ideaChip}>{idea}</Text>)}
        </View>
        <ActionButton label={t("createCampaign")} />
      </Section>
      <Section title={t("campaignReach")} dark>
        <StatGrid
          stats={[
            { value: "420", label: "Email" },
            { value: "180", label: "LINE" },
            { value: "64", label: "SNS" }
          ]}
        />
      </Section>
    </Screen>
  );
}

function AnalyticsScreen({ t }) {
  return (
    <Screen>
      <Section eyebrow={t("analytics")} title={t("analyticsTitle")}>
        <View style={styles.barList}>
          <MetricBar label="Custom homes" value={84} />
          <MetricBar label="Renovation" value={68} />
          <MetricBar label="Commercial" value={42} />
        </View>
      </Section>
      <Section title={t("nextStep")}>
        <Text style={styles.bodyText}>{t("nextStepBody")}</Text>
        <EmptyNotice text="MVP data is local. Connect Supabase next for live analytics." />
      </Section>
    </Screen>
  );
}

function LeadList({ title, expanded = false }) {
  return (
    <Section title={title}>
      {leads.slice(0, expanded ? leads.length : 2).map((lead) => (
        <View key={lead.id} style={styles.leadCard}>
          <View>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={styles.leadMeta}>{lead.id} / {lead.type} / {lead.language}</Text>
          </View>
          <View style={styles.statusColumn}>
            <Text style={styles.statusPill}>{lead.status}</Text>
            <Text style={styles.budgetText}>{lead.budget}</Text>
          </View>
        </View>
      ))}
    </Section>
  );
}

function ProjectList({ title, expanded = false }) {
  return (
    <Section title={title} dark>
      {projects.slice(0, expanded ? projects.length : 2).map((project) => (
        <View key={project.id} style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectStage}>{project.stage}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${project.stage}%` }]} />
          </View>
          <Text style={styles.nextText}>{project.next}</Text>
        </View>
      ))}
    </Section>
  );
}

function MetricBar({ label, value }) {
  return (
    <View style={styles.metricBar}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>
      <View style={styles.progressTrackLight}>
        <View style={[styles.progressFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: "rgba(32,33,31,0.72)",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: spacing.md
  },
  leadCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: "rgba(32,33,31,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  leadName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  leadMeta: {
    color: "rgba(32,33,31,0.52)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4
  },
  statusColumn: {
    alignItems: "flex-end",
    gap: 6
  },
  statusPill: {
    backgroundColor: colors.sumi,
    borderRadius: 999,
    color: colors.paper,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  budgetText: {
    color: colors.copper,
    fontWeight: "900"
  },
  projectCard: {
    backgroundColor: "rgba(247,242,232,0.07)",
    borderColor: "rgba(247,242,232,0.14)",
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  projectHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  projectName: {
    color: colors.paper,
    flex: 1,
    fontSize: 16,
    fontWeight: "900"
  },
  projectStage: {
    color: colors.aqua,
    fontWeight: "900"
  },
  progressTrack: {
    backgroundColor: "rgba(247,242,232,0.12)",
    borderRadius: 999,
    height: 8,
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  progressTrackLight: {
    backgroundColor: "rgba(32,33,31,0.1)",
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.cinnabar,
    borderRadius: 999,
    height: "100%"
  },
  nextText: {
    color: "rgba(247,242,232,0.62)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.sm
  },
  ideaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  ideaChip: {
    borderColor: "rgba(32,33,31,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    color: colors.indigo,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  barList: {
    gap: spacing.md
  },
  metricBar: {
    gap: spacing.xs
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metricLabel: {
    color: colors.ink,
    fontWeight: "900"
  },
  metricValue: {
    color: colors.copper,
    fontWeight: "900"
  }
});
