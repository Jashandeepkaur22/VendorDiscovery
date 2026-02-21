import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Clock, Download, ChevronRight } from "lucide-react";

const HistoryPanel = ({ history, onLoadHistory }) => {
  if (!history || history.length === 0) return null;

  const exportMarkdown = (item) => {
    let md = `# Vendor Shortlist for: ${item.need}\n\n`;
    md += `**Requirements:**\n${item.requirements.map((r) => `- ${r}`).join("\n")}\n\n`;

    if (item.exclusions && item.exclusions.length > 0) {
      md += `**Excluded Vendors:** ${item.exclusions.join(", ")}\n\n`;
    }

    md += `## Recommended Vendors\n\n`;

    item.results.forEach((v) => {
      md += `### ${v.vendorName}\n`;
      md += `- **Price Range:** ${v.priceRange}\n`;
      md += `- **Key Features Matched:** ${v.keyFeaturesMatched}\n`;
      md += `- **Risks & Limits:** ${v.risksAndLimits}\n`;

      if (v.quotedSnippets && v.quotedSnippets.length > 0) {
        md += `\n> ${v.quotedSnippets[0]}\n\n`;
      }

      if (v.evidenceLinks && v.evidenceLinks.length > 0) {
        md += `**Links:**\n${v.evidenceLinks.map((l) => `- [Evidence Link](${l})`).join("\n")}\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shortlist-${new Date(item.timestamp).getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50/50 pb-3 border-b">
        <CardTitle className="text-lg flex items-center text-gray-800">
          <Clock className="mr-2 h-5 w-5 text-gray-500" />
          Recent Shortlists
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-3 space-y-3">
        {history.map((item, index) => (
          <div
            key={index}
            className="group p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white flex flex-col gap-2"
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => onLoadHistory(item)}
            >
              <div className="flex flex-col pr-4">
                <span className="font-medium text-sm text-gray-900 line-clamp-2">
                  {item.need}
                </span>
                <span className="text-xs text-gray-500 mt-1 flex items-center">
                  {new Date(item.timestamp).toLocaleDateString()}
                  <span className="mx-1.5">•</span>
                  {item.results.length} vendors
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>
            <div className="flex justify-end pt-1 border-t border-gray-50 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  exportMarkdown(item);
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Export MD
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
