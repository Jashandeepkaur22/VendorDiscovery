import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PlusCircle, MinusCircle, Loader2 } from "lucide-react";

const VendorForm = ({ onSubmit, isLoading }) => {
  const [need, setNeed] = useState("");
  const [requirements, setRequirements] = useState(["", "", ""]);
  const [exclusions, setExclusions] = useState([""]);

  const handleRequirementChange = (index, value) => {
    const newReqs = [...requirements];
    newReqs[index] = value;
    setRequirements(newReqs);
  };

  const addRequirement = () => {
    if (requirements.length < 8) {
      setRequirements([...requirements, ""]);
    }
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const handleExclusionChange = (index, value) => {
    const newExclusions = [...exclusions];
    newExclusions[index] = value;
    setExclusions(newExclusions);
  };

  const addExclusion = () => {
    setExclusions([...exclusions, ""]);
  };

  const removeExclusion = (index) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRequirements = requirements.filter((r) => r.trim() !== "");
    const cleanExclusions = exclusions.filter((e) => e.trim() !== "");

    if (!need.trim() || cleanRequirements.length === 0) {
      alert("Please enter a need and at least one requirement.");
      return;
    }

    onSubmit({
      need: need.trim(),
      requirements: cleanRequirements,
      exclusions: cleanExclusions,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-900 border-b pb-2">
          Find Vendors
        </CardTitle>
        <CardDescription>
          Enter your core need and 5-8 requirements to generate a dynamic
          shortlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="need"
              className="text-base font-semibold text-gray-800"
            >
              Core Need
            </Label>
            <Input
              id="need"
              placeholder='e.g., "email delivery service for India" or "vector DB"'
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              className="border-gray-300 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-gray-800">
                Requirements (Budget, Region, Features)
              </Label>
            </div>
            {requirements.map((req, index) => (
              <div key={index} className="flex flex-row items-center gap-2">
                <span className="text-gray-500 font-mono text-sm w-4">
                  {index + 1}.
                </span>
                <Input
                  placeholder={`Requirement ${index + 1}`}
                  value={req}
                  onChange={(e) =>
                    handleRequirementChange(index, e.target.value)
                  }
                  className="flex-1 border-gray-300 focus-visible:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeRequirement(index)}
                  disabled={requirements.length <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {requirements.length < 8 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Requirement
              </Button>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <Label className="text-base font-semibold text-gray-800">
              Exclude Vendors (Optional)
            </Label>
            {exclusions.map((exclusion, index) => (
              <div key={index} className="flex flex-row items-center gap-2">
                <Input
                  placeholder="e.g., SendGrid, Pinecone"
                  value={exclusion}
                  onChange={(e) => handleExclusionChange(index, e.target.value)}
                  className="flex-1 border-gray-300 focus-visible:ring-gray-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => removeExclusion(index)}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addExclusion}
              className="mt-2 text-gray-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exclusion
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-md transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing &
                Searching Web...
              </>
            ) : (
              "Build Shortlist"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorForm;
