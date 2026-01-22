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