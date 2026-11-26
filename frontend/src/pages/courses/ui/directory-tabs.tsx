import { useState } from "react";
import { directoryTabs } from "../model/course-directory.mock";

export function DirectoryTabs() {
  const [activeTab, setActiveTab] = useState("Courses");

  return (
    <div className="directory-tab-row">
      <div className="directory-tabs" role="tablist" aria-label="Directory type">
        {directoryTabs.map((tab) => (
          <button
            className={`directory-tab${activeTab === tab.label ? " is-active" : ""}`}
            id={`tab-${tab.label.toLowerCase()}`}
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}
            <span className="tab-count">{tab.count.toLocaleString("en-US")}</span>
          </button>
        ))}
      </div>
      <button className="saved-search-link" type="button">
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M5.5 3.5h9v13l-4.5-3-4.5 3v-13Z" />
        </svg>
        Saved searches
      </button>
    </div>
  );
}