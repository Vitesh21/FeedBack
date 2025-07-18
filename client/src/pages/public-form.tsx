import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PublicForm() {
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    respondentName: "",
    respondentEmail: "",
    answers: {} as Record<number, string>,
  });

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["/api/public/forms", params.id],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const answersArray = Object.entries(data.answers).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      }));

      await apiRequest("POST", `/api/public/forms/${params.id}/responses`, {
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        answers: answersArray,
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const updateAnswer = (questionId: number, value: string) => {
    setFormData({
      ...formData,
      answers: {
        ...formData.answers,
        [questionId]: value,
      },
    });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      respondentName: "",
      respondentEmail: "",
      answers: {},
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Form Not Found</h1>
            <p className="text-slate-600">
              This form may have been removed or is no longer accepting responses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-success text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Thank You!</h2>
              <p className="text-lg text-slate-600 mb-6">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
              </p>
              <Button onClick={resetForm} className="bg-primary text-white">
                Submit Another Response
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <MessageSquare className="mr-2 h-3 w-3" />
            Powered by FeedbackFlow
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{form.title}</h1>
          <p className="text-lg text-slate-600">{form.description}</p>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {form.questions?.map((question: any, index: number) => (
                <div key={question.id}>
                  <label className="block text-lg font-medium text-slate-900 mb-3">
                    {index + 1}. {question.title}
                    {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {question.type === "text" && (
                    <Textarea
                      value={formData.answers[question.id] || ""}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                      placeholder="Your answer..."
                      rows={4}
                      required={question.isRequired}
                      className="resize-none"
                    />
                  )}

                  {question.type === "multiple_choice" && (
                    <div className="space-y-3">
                      {question.options?.map((option: string, optionIndex: number) => (
                        <label
                          key={optionIndex}
                          className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={formData.answers[question.id] === option}
                            onChange={(e) => updateAnswer(question.id, e.target.value)}
                            required={question.isRequired}
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          <span className="ml-3 text-base text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "rating" && (
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-base text-slate-600 font-medium">1</span>
                      <div className="flex space-x-3">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => updateAnswer(question.id, rating.toString())}
                            className={`w-12 h-12 border-2 rounded-full font-medium transition-all ${
                              formData.answers[question.id] === rating.toString()
                                ? "border-primary bg-primary text-white"
                                : "border-slate-300 text-slate-600 hover:border-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <span className="text-base text-slate-600 font-medium">5</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Contact Information */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Contact Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <Input
                      value={formData.respondentName}
                      onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.respondentEmail}
                      onChange={(e) => setFormData({ ...formData, respondentEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2 flex items-center">
                  <Shield className="mr-1 h-4 w-4" />
                  Your contact information will only be used to follow up on your feedback if needed.
                </p>
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-8">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-primary text-white py-4 text-lg font-semibold"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
                <p className="text-sm text-slate-500 text-center mt-3">
                  Your feedback is anonymous unless you provide contact information.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
