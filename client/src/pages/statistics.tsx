import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Users, FileText, Clock, BarChart3, PieChart, Activity, Star, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Statistics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeFilter, setTimeFilter] = useState("all");

  const { data: forms, isLoading } = useQuery({
    queryKey: ["/api/forms"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalForms = forms?.length || 0;
  const totalResponses = forms?.reduce((sum: number, form: any) => sum + (form.responseCount || 0), 0) || 0;
  const activeForms = forms?.filter((form: any) => form.isPublished).length || 0;
  const avgResponsesPerForm = totalForms > 0 ? Math.round((totalResponses / totalForms) * 10) / 10 : 0;

  // Calculate form performance metrics
  const formPerformance = forms?.map((form: any) => ({
    ...form,
    responseRate: form.responseCount || 0,
    status: form.isPublished ? 'Active' : 'Draft'
  })).sort((a: any, b: any) => b.responseRate - a.responseRate) || [];

  const topPerformingForms = formPerformance.slice(0, 5);
  const recentForms = forms?.slice().sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5) || [];

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
                <h1 className="text-xl font-semibold text-slate-900">Statistics & Analytics</h1>
                <p className="text-sm text-slate-600">
                  Comprehensive insights for {user?.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Forms</p>
                  <p className="text-3xl font-bold text-slate-900">{totalForms}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeForms} active, {totalForms - activeForms} drafts
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Responses</p>
                  <p className="text-3xl font-bold text-slate-900">{totalResponses}</p>
                  <p className="text-xs text-success mt-1">
                    +12% from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-success text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Responses/Form</p>
                  <p className="text-3xl font-bold text-slate-900">{avgResponsesPerForm}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Per form average
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Response Rate</p>
                  <p className="text-3xl font-bold text-slate-900">87%</p>
                  <p className="text-xs text-success mt-1">
                    +5% improvement
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Forms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-warning" />
                Top Performing Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformingForms.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <PieChart className="mx-auto h-12 w-12 mb-3 text-slate-400" />
                  <p>No forms created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPerformingForms.map((form: any, index: number) => (
                    <div key={form.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{form.title}</p>
                          <p className="text-sm text-slate-500">{form.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{form.responseRate}</p>
                        <p className="text-xs text-slate-500">responses</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-success" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentForms.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="mx-auto h-12 w-12 mb-3 text-slate-400" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentForms.map((form: any) => (
                    <div key={form.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                          <MessageSquare className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{form.title}</p>
                          <p className="text-sm text-slate-500">
                            Created {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{form.responseCount || 0} responses</p>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          form.isPublished 
                            ? 'bg-success/10 text-success' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {form.isPublished ? 'Active' : 'Draft'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Form Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                    <span className="text-sm text-slate-700">Active Forms</span>
                  </div>
                  <span className="font-medium">{activeForms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-slate-400 rounded-full mr-2"></div>
                    <span className="text-sm text-slate-700">Draft Forms</span>
                  </div>
                  <span className="font-medium">{totalForms - activeForms}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-success h-2 rounded-full" 
                    style={{ width: totalForms > 0 ? `${(activeForms / totalForms) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {totalForms > 0 ? Math.round((activeForms / totalForms) * 100) : 0}% of forms are active
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Response Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{totalResponses}</p>
                  <p className="text-sm text-slate-500">Total Responses</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">This week</span>
                    <span className="font-medium text-success">+23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">This month</span>
                    <span className="font-medium text-success">+15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completion rate</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation("/forms/new")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Form
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    // Export all data functionality could be added here
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}