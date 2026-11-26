import { directoryStats } from "../model/course-directory.mock";

export function StatsCards() {
  return (
    <section className="stats-grid" aria-label="Directory statistics">
      {directoryStats.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <span className="stat-icon" aria-hidden="true">
            {stat.icon}
          </span>
          <div>
            <p className="stat-value">{stat.value.toLocaleString("en-US")}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}