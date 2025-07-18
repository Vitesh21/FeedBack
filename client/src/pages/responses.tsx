import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share, BarChart, FileText, TrendingUp, Percent, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Responses() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ["/api/forms", params.id],
  });

  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ["/api/forms", params.id, "responses"],
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}/export`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form?.title || "form"}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your CSV file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/f/${params.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "The form link has been copied to your clipboard.",
    });
  };

  if (formLoading || responsesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Form Not Found</h1>
            <Button onClick={() => setLocation("/")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalResponses = responses?.length || 0;
  const completionRate = totalResponses > 0 ? 87 : 0; // Mock completion rate
  const avgRating = responses?.length > 0 ? 4.2 : 0; // Mock average rating
  const avgResponseTime = "2.3m"; // Mock response time

  // Calculate question summaries
  const questionSummaries = form.questions?.map((question: any) => {
    const questionResponses = responses?.map((response: any) => 
      response.answers.find((answer: any) => answer.questionId === question.id)
    ).filter(Boolean) || [];

    if (question.type === "multiple_choice") {
      const optionCounts = (question.options || []).reduce((acc: any, option: string) => {
        acc[option] = questionResponses.filter((answer: any) => answer.value === option).length;
        return acc;
      }, {});
      
      return {
        ...question,
        optionCounts,
        totalResponses: questionResponses.length,
      };
    }

    if (question.type === "rating") {
      const ratings = questionResponses.map((answer: any) => parseInt(answer.value)).filter(r => !isNaN(r));
      const average = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      
      const ratingCounts = [1, 2, 3, 4, 5].reduce((acc: any, rating) => {
        acc[rating] = ratings.filter(r => r === rating).length;
        return acc;
      }, {});

      return {
        ...question,
        average: Math.round(average * 10) / 10,
        ratingCounts,
        totalResponses: ratings.length,
      };
    }

    return {
      ...question,
      responses: questionResponses.slice(0, 5), // Show recent text responses
      totalResponses: questionResponses.length,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{form.title}</h1>
                <p className="text-sm text-slate-600">
                  {totalResponses} responses • Created {new Date(form.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Responses</p>
                  <p className="text-3xl font-bold text-slate-900">{totalResponses}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Percent className="text-success text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Rating</p>
                  <p className="text-3xl font-bold text-slate-900">{avgRating}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Response Time</p>
                  <p className="text-3xl font-bold text-slate-900">{avgResponseTime}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle and Filters */}
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="summary" className="w-auto">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-8">
              {/* Summary View */}
              <div className="space-y-8">
                {questionSummaries.map((question: any) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{question.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question.type === "text" && (
                        <div className="space-y-4">
                          <div className="text-sm text-slate-600">
                            {question.totalResponses} text responses
                          </div>
                          {question.responses?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Responses:</h4>
                              <div className="space-y-3">
                                {question.responses.map((answer: any, index: number) => (
                                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-700">"{answer.value}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {question.type === "multiple_choice" && (
                        <div className="space-y-4">
                          {Object.entries(question.optionCounts || {}).map(([option, count]: [string, any]) => {
                            const percentage = question.totalResponses > 0 
                              ? Math.round((count / question.totalResponses) * 100) 
                              : 0;
                            return (
                              <div key={option} className="flex items-center justify-between">
                                <span className="text-sm text-slate-700">{option}</span>
                                <div className="flex items-center">
                                  <div className="w-32 bg-slate-200 rounded-full h-2 mr-3">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-900">
                                    {percentage}% ({count})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {question.type === "rating" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-3xl font-bold text-slate-900">{question.average}</span>
                            <div className="text-right">
                              <div className="flex items-center text-warning mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${star <= Math.round(question.average) ? 'fill-current' : ''}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-slate-600">Average rating</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = question.ratingCounts?.[rating] || 0;
                              const percentage = question.totalResponses > 0 
                                ? Math.round((count / question.totalResponses) * 100) 
                                : 0;
                              return (
                                <div key={rating} className="flex items-center justify-between">
                                  <span className="text-sm text-slate-700">{rating} stars</span>
                                  <div className="flex items-center">
                                    <div className="w-32 bg-slate-200 rounded-full h-2 mr-3">
                                      <div 
                                        className="bg-warning h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                      {percentage}% ({count})
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="raw-data" className="mt-8">
              {/* Raw Data View */}
              <Card>
                <CardContent>
                  {!responses || responses.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No responses yet</h3>
                      <p className="text-slate-600">Responses will appear here once people start submitting your form.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            {form.questions?.map((question: any) => (
                              <TableHead key={question.id} className="min-w-[200px]">
                                {question.title}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((response: any) => (
                            <TableRow key={response.id}>
                              <TableCell className="whitespace-nowrap text-sm text-slate-500">
                                {new Date(response.submittedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm text-slate-900">
                                {response.respondentName || "-"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm text-slate-500">
                                {response.respondentEmail || "-"}
                              </TableCell>
                              {form.questions?.map((question: any) => {
                                const answer = response.answers.find((a: any) => a.questionId === question.id);
                                return (
                                  <TableCell key={question.id} className="text-sm text-slate-900 max-w-xs">
                                    <div className="truncate">
                                      {answer?.value || "-"}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
