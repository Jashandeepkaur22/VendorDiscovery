import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  MessageSquareQuote,
} from "lucide-react";

const ShortlistTable = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <Card className="w-full mt-8 shadow-xl border-blue-100 overflow-hidden">
      <CardHeader className="bg-blue-50/50 pb-4 border-b">
        <CardTitle className="text-xl text-blue-900 flex items-center">
          <CheckCircle2 className="mr-2 text-green-600 h-5 w-5" />
          Recommended Vendors Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="w-[150px] font-bold text-gray-900">
                Vendor
              </TableHead>
              <TableHead className="w-[150px] font-bold text-gray-900">
                Price Range
              </TableHead>
              <TableHead className="w-[300px] font-bold text-gray-900">
                Key Features Matched
              </TableHead>
              <TableHead className="w-[250px] font-bold text-gray-900">
                Risks / Limits
              </TableHead>
              <TableHead className="font-bold text-gray-900">
                Evidence
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((vendor, index) => (
              <TableRow
                key={index}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <TableCell className="font-semibold text-blue-800 text-base align-top">
                  {vendor.vendorName}
                </TableCell>
                <TableCell className="align-top font-medium text-green-700">
                  {vendor.priceRange}
                </TableCell>
                <TableCell className="align-top">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vendor.keyFeaturesMatched}
                  </p>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">
                      {vendor.risksAndLimits}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-3">
                    {vendor.quotedSnippets &&
                      vendor.quotedSnippets.length > 0 && (
                        <div className="bg-gray-50 p-2 rounded border text-xs text-gray-600 italic border-l-4 border-l-blue-400">
                          <MessageSquareQuote className="inline h-3 w-3 mr-1 text-blue-400" />
                          "{vendor.quotedSnippets[0]}"
                        </div>
                      )}
                    <div className="flex flex-col gap-1.5">
                      {vendor.evidenceLinks &&
                        vendor.evidenceLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center hover:underline truncate max-w-[200px]"
                            title={link}
                          >
                            <ExternalLink className="h-3 w-3 mr-1 shrink-0" />
                            {new URL(link).hostname}
                          </a>
                        ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ShortlistTable;
