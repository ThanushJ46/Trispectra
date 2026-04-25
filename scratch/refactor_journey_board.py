import os

filepath = r"c:\trispectra\Trispectra\frontend\src\App.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# LeaderboardScreen
content = content.replace("function LeaderboardScreen({ user, userStats }) {", "function LeaderboardScreen({ user, userStats }) {\n  const { t } = useTranslation();")
content = content.replace(">YOUR RANK<", ">{t('board.your_rank')}<")
content = content.replace(">in city<", ">{t('board.in_city')}<")
content = content.replace(">TOTAL IMPACT<", ">{t('board.total_impact')}<")
content = content.replace(">Points<", ">{t('board.points')}<")
content = content.replace(">Top Savers<", ">{t('board.top_savers')}<")
content = content.replace(">All Time<", ">{t('board.all_time')}<")
content = content.replace(">No rankings yet. Be the first! 🌱<", ">{t('board.no_rankings')}<")
content = content.replace(">pts<", ">{t('board.pts')}<")
content = content.replace("isMe ? 'You' :", "isMe ? t('board.you') :")

# JourneyScreen
content = content.replace("function JourneyScreen({ user, userStats, onNav }) {", "function JourneyScreen({ user, userStats, onNav }) {\n  const { t } = useTranslation();")
content = content.replace(">Personal Impact Dashboard<", ">{t('journey.title')}<")
content = content.replace(">See the real-world difference you're making.<", ">{t('journey.subtitle')}<")
content = content.replace(">Your Eco-Footprint<", ">{t('journey.eco_footprint')}<")
content = content.replace(">Trees Saved<", ">{t('journey.trees_saved')}<")
content = content.replace(">Bottles Rescued<", ">{t('journey.bottles_rescued')}<")
content = content.replace(">kg Diverted<", ">{t('journey.kg_diverted')}<")
content = content.replace(">Impact Points<", ">{t('journey.impact_points')}<")
content = content.replace(">Your Progress<", ">{t('journey.progress')}<")
content = content.replace(
    "You have successfully diverted <strong>{kgDiverted.toFixed(1)} kg</strong> of waste from landfills. That's a <strong>{(kgDiverted === 0 ? 0 : 15.5).toFixed(1)}%</strong> improvement this month! Keep up the great work sorting your items correctly.",
    "{t('journey.progress_text', {kg: kgDiverted.toFixed(1)})}"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
