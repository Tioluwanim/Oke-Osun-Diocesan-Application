from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class LessonItem(BaseModel):
    title: str
    content: str
    scripture: Optional[str] = None

class CreateBibleStudyRequest(BaseModel):
    title: str = Field(min_length=3)
    book: str
    lessons: int = 1
    level: Literal["Beginner", "Intermediate", "Advanced"] = "Beginner"
    description: Optional[str] = None
    lessonItems: Optional[List[LessonItem]] = []
    url: Optional[str] = None

class UpdateBibleStudyRequest(BaseModel):
    title: Optional[str] = None
    book: Optional[str] = None
    lessons: Optional[int] = None
    level: Optional[str] = None
    description: Optional[str] = None
    lessonItems: Optional[List[LessonItem]] = None
    url: Optional[str] = None