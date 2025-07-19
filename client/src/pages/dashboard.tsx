import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Plus, User, ChevronDown, FileText, TrendingUp, Percent, Play, MoreHorizontal, BarChart, Edit, Share, Trash } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: forms, isLoading } = useQuery({
    queryKey: ["/api/forms"],
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      await apiRequest("DELETE", `/api/forms/${formId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalForms = forms?.length || 0;
  const totalResponses = forms?.reduce((sum: number, form: any) => sum + (form.responseCount || 0), 0) || 0;
  const activeForms = forms?.filter((form: any) => form.isPublished).length || 0;

  const handleDeleteForm = (formId: number) => {
    if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      deleteFormMutation.mutate(formId);
    }
  };

  const handleShare = (formId: number) => {
    const url = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "The form link has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">FeedbackFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => setLocation("/forms/new")} className="bg-primary text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Form
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{user?.username}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Forms</p>
                  <p className="text-3xl font-bold text-slate-900">{totalForms}</p>
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
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-success text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Forms</p>
                  <p className="text-3xl font-bold text-slate-900">{activeForms}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Play className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Response Rate</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {totalForms > 0 ? Math.round((totalResponses / totalForms) * 100) / 100 : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Percent className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Forms</CardTitle>
                <CardDescription>Manage and view responses for your feedback forms</CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Input 
                  type="text" 
                  placeholder="Search forms..." 
                  className="w-64"
                />
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!forms || forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No forms yet</h3>
                <p className="text-slate-600 mb-4">Create your first feedback form to get started.</p>
                <Button onClick={() => setLocation("/forms/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form: any) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{form.title}</div>
                            <div className="text-sm text-slate-500">{form.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{form.responseCount || 0}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={form.isPublished ? "default" : "secondary"}>
                          {form.isPublished ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/forms/${form.id}/responses`)}>
                              <BarChart className="mr-2 h-4 w-4" />
                              View Responses
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/forms/${form.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Form
                            </DropdownMenuItem>
                            {form.isPublished && (
                              <DropdownMenuItem onClick={() => handleShare(form.id)}>
                                <Share className="mr-2 h-4 w-4" />
                                Share Form
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteForm(form.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Form
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
