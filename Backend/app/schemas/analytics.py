from pydantic import BaseModel
from typing import List, Optional


class ChartPoint(BaseModel):
    label: str
    value: float


class AnalyticsMetrics(BaseModel):
    totalRevenue: float
    activeStudents: int
    completionRate: float
    avgRating: float
    revenueChange: float
    studentsChange: float
    totalEnrolled: int
    totalReviews: int


class AnalyticsReport(BaseModel):
    metrics: AnalyticsMetrics
    revenue_chart: List[ChartPoint]
    enrollment_chart: List[ChartPoint]


class CourseModuleStat(BaseModel):
    name: str
    completion: float
    status: str


class CourseDetailReport(BaseModel):
    modules: List[CourseModuleStat]
    total_students: int


# ── New schemas for expanded analytics ────────────────────

class CourseStat(BaseModel):
    id: str
    title: str
    status: str
    student_count: int
    revenue: float
    rating_avg: float
    rating_count: int
    completion_rate: float


class RevenuePoint(BaseModel):
    label: str
    revenue: float
    purchases: int


class StudentsPoint(BaseModel):
    label: str
    students: int


class AnalyticsSummary(BaseModel):
    total_courses: int
    total_students: int
    total_revenue: float
    avg_rating: float