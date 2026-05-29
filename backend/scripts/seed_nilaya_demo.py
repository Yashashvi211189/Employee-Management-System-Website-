import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings_local")

import django

django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone

from account.employee_models import EmployeeProfile
from account.models import Blog, GisService, Product, Project, Service, TeamMember, Testimonial


User = get_user_model()


def ensure_admin():
    admin, _ = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@example.com",
            "firstname": "Nilaya",
            "lastname": "Admin",
            "is_staff": True,
            "is_superuser": True,
            "is_admin": True,
            "is_active": True,
        },
    )
    admin.email = "admin@example.com"
    admin.firstname = admin.firstname or "Nilaya"
    admin.lastname = admin.lastname or "Admin"
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_admin = True
    admin.is_active = True
    admin.set_password("admin123")
    admin.save()
    return admin


def ensure_employee():
    user, _ = User.objects.get_or_create(
        username="nilaya.employee",
        defaults={
            "email": "employee@nilaya.ai",
            "firstname": "Aarav",
            "lastname": "Sharma",
            "phoneno": "9876543210",
            "is_active": True,
        },
    )
    user.email = "employee@nilaya.ai"
    user.firstname = "Aarav"
    user.lastname = "Sharma"
    user.phoneno = "9876543210"
    user.is_active = True
    user.set_password("Employee@123")
    user.save()

    profile, _ = EmployeeProfile.objects.get_or_create(
        user=user,
        defaults={
            "employee_id": "NA10001",
            "phone": "9876543210",
            "designation": "Automation Specialist",
            "qualification": "B.Tech in Computer Science",
            "employment_type": "full_time",
            "location": "Remote - India",
            "status": "active",
        },
    )
    profile.employee_id = "NA10001"
    profile.phone = "9876543210"
    profile.designation = "Automation Specialist"
    profile.qualification = "B.Tech in Computer Science"
    profile.employment_type = "full_time"
    profile.location = "Remote - India"
    profile.status = "active"
    profile.save()
    return profile


def seed_team():
    members = [
        {
            "name": "Mira Kapoor",
            "role": "AI Systems Architect",
            "department": "AI Engineering",
            "location": "Bengaluru",
            "bio": "Designs reliable LLM systems, orchestration layers, and enterprise-grade automation flows.",
            "member_type": "executive",
            "skills": ["LLM orchestration", "System design", "AI governance"],
            "achievements": ["Delivered 20+ production AI rollouts", "Built multi-tenant workflow platforms"],
            "experience": "12 years across AI products, cloud platforms, and platform architecture.",
        },
        {
            "name": "Rohan Mehta",
            "role": "Automation Delivery Lead",
            "department": "Automation",
            "location": "Pune",
            "bio": "Leads business process automation initiatives across support, finance, and operations teams.",
            "member_type": "employee",
            "skills": ["Process automation", "API design", "Integrations"],
            "achievements": ["Reduced manual operations by 68%", "Scaled automation programs across 6 business units"],
            "experience": "9 years in workflow engineering and SaaS delivery.",
        },
        {
            "name": "Sara Dsouza",
            "role": "Document Intelligence Engineer",
            "department": "Data Systems",
            "location": "Mumbai",
            "bio": "Builds OCR, document parsing, and retrieval systems for knowledge-heavy teams.",
            "member_type": "employee",
            "skills": ["OCR pipelines", "Vector search", "Data extraction"],
            "achievements": ["Shipped document AI for compliance teams", "Improved extraction accuracy to 96%"],
            "experience": "7 years in machine learning and intelligent document workflows.",
        },
    ]

    result = []
    for index, item in enumerate(members, start=1):
        member, _ = TeamMember.objects.get_or_create(
            name=item["name"],
            defaults={
                **item,
                "status": "Active",
                "memberID": f"TEAM-{index:03d}",
                "joinDate": timezone.now().date(),
                "use_cases": [
                    {
                        "title": "Enterprise AI Delivery",
                        "description": "Bridges product strategy, architecture, and rollout planning.",
                        "image": "",
                        "layout": "image_left",
                    }
                ],
            },
        )
        member.role = item["role"]
        member.department = item["department"]
        member.location = item["location"]
        member.bio = item["bio"]
        member.status = "Active"
        member.member_type = item["member_type"]
        member.memberID = member.memberID or f"TEAM-{index:03d}"
        member.joinDate = member.joinDate or timezone.now().date()
        member.skills = item["skills"]
        member.achievements = item["achievements"]
        member.experience = item["experience"]
        member.use_cases = member.use_cases or [
            {
                "title": "Enterprise AI Delivery",
                "description": "Bridges product strategy, architecture, and rollout planning.",
                "image": "",
                "layout": "image_left",
            }
        ]
        member.save()
        result.append(member)
    return result


def seed_services(team_members):
    items = [
        {
            "title": "AI Workflow Automation",
            "description": "Automate repetitive business operations with resilient AI-assisted workflows.",
            "long_description": "Nilaya AI designs automation systems that connect business tools, approval loops, and decision logic into one operational pipeline.",
            "features": ["Task routing", "Approvals and escalations", "Human-in-the-loop checkpoints"],
            "benefits": ["Lower manual effort", "Faster turnaround times", "Clear operational visibility"],
            "technologies": ["Python", "Next.js", "OpenAI APIs", "Webhook automation"],
        },
        {
            "title": "Custom AI Applications",
            "description": "Launch tailored AI products that match your workflows, data, and operating model.",
            "long_description": "From internal copilots to client-facing assistants, we build full-stack AI applications with strong guardrails and production readiness.",
            "features": ["Custom UI flows", "Role-based experiences", "Analytics and monitoring"],
            "benefits": ["Faster product launches", "Tighter fit to business needs", "Scalable architecture"],
            "technologies": ["React", "TypeScript", "FastAPI", "Postgres"],
        },
        {
            "title": "Document Intelligence",
            "description": "Extract, classify, and operationalize knowledge trapped inside files and records.",
            "long_description": "We build document pipelines that read contracts, forms, SOPs, and reports to power search, automation, and compliance workflows.",
            "features": ["OCR extraction", "Metadata enrichment", "Search-ready outputs"],
            "benefits": ["Less manual review", "Faster knowledge access", "Improved auditability"],
            "technologies": ["OCR", "Embeddings", "Vector databases", "Secure storage"],
        },
    ]

    created = []
    for index, item in enumerate(items, start=1):
        service, _ = Service.objects.get_or_create(
            title=item["title"],
            defaults={
                **item,
                "status": "active",
                "sort_order": index,
                "use_cases": [
                    {
                        "title": "Operations Enablement",
                        "description": f"Applied {item['title'].lower()} to streamline internal delivery and reporting.",
                        "image": "",
                        "layout": "image_left",
                    }
                ],
                "explore": {
                    "title": item["title"],
                    "summary": item["description"],
                    "subsections": [
                        {
                            "slug": "overview",
                            "title": "Overview",
                            "description": item["long_description"],
                            "content": item["long_description"],
                            "images": [],
                            "use_cases": [],
                        }
                    ],
                },
            },
        )
        service.description = item["description"]
        service.long_description = item["long_description"]
        service.features = item["features"]
        service.benefits = item["benefits"]
        service.technologies = item["technologies"]
        service.status = "active"
        service.sort_order = index
        service.use_cases = service.use_cases or [
            {
                "title": "Operations Enablement",
                "description": f"Applied {item['title'].lower()} to streamline internal delivery and reporting.",
                "image": "",
                "layout": "image_left",
            }
        ]
        service.explore = service.explore or {
            "title": item["title"],
            "summary": item["description"],
            "subsections": [
                {
                    "slug": "overview",
                    "title": "Overview",
                    "description": item["long_description"],
                    "content": item["long_description"],
                    "images": [],
                    "use_cases": [],
                }
            ],
        }
        service.save()
        service.developers.set(team_members[:2])
        created.append(service)
    return created


def seed_gis_services(team_members):
    items = [
        {
            "title": "Spatial Intelligence Automation",
            "description": "Transform geospatial data into decision-ready insights and automated workflows.",
            "long_description": "Nilaya AI connects map intelligence, satellite layers, and business reporting for teams managing assets, infrastructure, and field operations.",
            "features": ["Map-based insights", "Layer analysis", "Scheduled reporting"],
            "benefits": ["Faster spatial decisions", "Shared situational awareness", "Less manual map processing"],
            "technologies": ["GIS", "GeoJSON", "Python", "Cloud storage"],
        }
    ]

    created = []
    for index, item in enumerate(items, start=1):
        service, _ = GisService.objects.get_or_create(
            title=item["title"],
            defaults={
                **item,
                "status": "active",
                "sort_order": index,
                "use_cases": [
                    {
                        "title": "Infrastructure Monitoring",
                        "description": "Automated map analysis for distributed assets and field teams.",
                        "image": "",
                        "layout": "image_left",
                    }
                ],
                "explore": {
                    "title": item["title"],
                    "summary": item["description"],
                    "subsections": [
                        {
                            "slug": "overview",
                            "title": "Overview",
                            "description": item["long_description"],
                            "content": item["long_description"],
                            "images": [],
                            "use_cases": [],
                        }
                    ],
                },
            },
        )
        service.description = item["description"]
        service.long_description = item["long_description"]
        service.features = item["features"]
        service.benefits = item["benefits"]
        service.technologies = item["technologies"]
        service.status = "active"
        service.sort_order = index
        service.save()
        service.developers.set(team_members[:1])
        created.append(service)
    return created


def seed_products():
    items = [
        {
            "name": "FlowGrid",
            "tagline": "AI workflow orchestration for fast-moving operations teams.",
            "description": "Unify tasks, approvals, and AI copilots in one automation workspace.",
            "fullDescription": "FlowGrid helps teams design intelligent workflows that trigger actions, summarize work, and keep humans in control when it matters.",
            "features": ["Visual workflow builder", "Approval chains", "Knowledge-aware copilots"],
            "outcomes": ["Reduced response times", "Consistent execution", "Improved team throughput"],
            "technologies": ["Next.js", "Python", "Postgres"],
            "platforms": ["Web", "Cloud"],
            "integrations": ["Slack", "HubSpot", "Gmail"],
            "support": ["Onboarding", "Architecture reviews", "Priority support"],
            "stats": [
                {"label": "Deployments", "value": "18"},
                {"label": "Uptime", "value": "99.9%"},
                {"label": "Time Saved", "value": "42%"},
            ],
            "category": "automation",
        },
        {
            "name": "SignalIQ",
            "tagline": "Decision intelligence for AI-enabled operations.",
            "description": "Turn scattered business data into explainable insights and action paths.",
            "fullDescription": "SignalIQ centralizes metrics, events, and AI-generated summaries so leaders can act quickly with context they can trust.",
            "features": ["Live KPI tracking", "Narrative summaries", "Action recommendations"],
            "outcomes": ["Higher visibility", "Faster decisions", "Cleaner reporting"],
            "technologies": ["React", "FastAPI", "Vector search"],
            "platforms": ["Web"],
            "integrations": ["Notion", "Google Sheets", "Salesforce"],
            "support": ["Implementation guidance", "Model tuning", "Quarterly reviews"],
            "stats": [
                {"label": "Dashboards", "value": "24"},
                {"label": "Coverage", "value": "10 teams"},
                {"label": "Reporting Time", "value": "-61%"},
            ],
            "category": "analytics",
        },
    ]

    result = []
    for index, item in enumerate(items, start=1):
        product, _ = Product.objects.get_or_create(
            name=item["name"],
            defaults={
                **item,
                "status": "active",
                "featured": True,
                "sortOrder": index,
            },
        )
        product.tagline = item["tagline"]
        product.description = item["description"]
        product.fullDescription = item["fullDescription"]
        product.features = item["features"]
        product.outcomes = item["outcomes"]
        product.challenges = []
        product.technologies = item["technologies"]
        product.stats = item["stats"]
        product.platforms = item["platforms"]
        product.integrations = item["integrations"]
        product.support = item["support"]
        product.category = item["category"]
        product.status = "active"
        product.featured = True
        product.sortOrder = index
        product.liveUrl = "https://nilaya.ai/contact"
        product.demoUrl = "https://nilaya.ai/contact"
        product.documentationUrl = "https://nilaya.ai/blog"
        product.save()
        result.append(product)
    return result


def seed_projects(manager):
    items = [
        {
            "title": "Support Automation Command Center",
            "description": "A unified AI support workspace for ticket triage, prioritization, and response drafting.",
            "shortDescription": "AI support automation for fast-growing teams.",
            "client": "Nimbus Retail",
            "category": "AI Automation",
            "technologies": "Next.js, Python, OpenAI, Postgres",
            "details": "Centralized support workflows with AI suggestions, routing logic, and reporting dashboards.",
            "challenges": ["Fragmented support operations", "Slow response times"],
            "outcomes": ["38% faster first response", "Improved CSAT consistency"],
            "stats": {"impact": "38% faster", "channels": "5", "coverage": "24/7"},
            "featured": True,
        },
        {
            "title": "Document Ops Intelligence Suite",
            "description": "An internal knowledge pipeline for document ingestion, extraction, and audit-friendly search.",
            "shortDescription": "Document AI for compliance-heavy operations.",
            "client": "Northwind Finance",
            "category": "Document Intelligence",
            "technologies": "OCR, Python, Vector DB",
            "details": "Created a searchable knowledge layer across operational documents with extraction and traceability built in.",
            "challenges": ["Manual review bottlenecks", "Slow cross-team retrieval"],
            "outcomes": ["60% reduction in review time", "Searchable document archive"],
            "stats": {"accuracy": "96%", "review_time": "-60%", "documents": "250k+"},
            "featured": True,
        },
    ]

    result = []
    for index, item in enumerate(items, start=1):
        project, _ = Project.objects.get_or_create(
            title=item["title"],
            defaults={
                **item,
                "status": "Completed",
                "project_manager": manager,
                "timeline": "12 weeks",
                "team": "Nilaya AI Delivery Pod",
                "working_days": [],
                "gallery": [],
                "color": "#4F46E5",
                "icon": "sparkles",
                "testimonial_name": "Jordan Lee",
                "testimonial_role": "Operations Director",
                "testimonial_quote": "Nilaya AI helped us turn manual workflows into a measurable operating advantage.",
                "testimonial_rating": 5,
            },
        )
        project.description = item["description"]
        project.shortDescription = item["shortDescription"]
        project.client = item["client"]
        project.category = item["category"]
        project.technologies = item["technologies"]
        project.status = "Completed"
        project.timeline = "12 weeks"
        project.team = "Nilaya AI Delivery Pod"
        project.project_manager = manager
        project.details = item["details"]
        project.challenges = item["challenges"]
        project.outcomes = item["outcomes"]
        project.stats = item["stats"]
        project.featured = item["featured"]
        project.gallery = []
        project.color = "#4F46E5"
        project.icon = "sparkles"
        project.testimonial_name = "Jordan Lee"
        project.testimonial_role = "Operations Director"
        project.testimonial_quote = "Nilaya AI helped us turn manual workflows into a measurable operating advantage."
        project.testimonial_rating = 5
        project.save()
        result.append(project)
    return result


def seed_testimonials():
    items = [
        {
            "name": "Jordan Lee",
            "company": "Nimbus Retail",
            "role": "Operations Director",
            "text": "Nilaya AI helped us launch automation that actually stuck with our team. The workflows are faster, clearer, and much easier to scale.",
        },
        {
            "name": "Priya Nair",
            "company": "Northwind Finance",
            "role": "Head of Transformation",
            "text": "Their mix of AI product thinking and implementation discipline made the rollout feel calm, structured, and measurable from week one.",
        },
    ]

    result = []
    for index, item in enumerate(items, start=1):
        testimonial, _ = Testimonial.objects.get_or_create(
            name=item["name"],
            defaults={**item, "status": "active", "sort_order": index, "linkedin": "/#"},
        )
        testimonial.company = item["company"]
        testimonial.role = item["role"]
        testimonial.text = item["text"]
        testimonial.status = "active"
        testimonial.sort_order = index
        testimonial.linkedin = "/#"
        testimonial.save()
        result.append(testimonial)
    return result


def seed_blogs():
    items = [
        {
            "title": "How AI Workflow Automation Creates Real Operational Lift",
            "slug": "ai-workflow-automation-operational-lift",
            "excerpt": "A practical look at how automation systems reduce bottlenecks and improve decision speed across modern teams.",
            "content": "<p>Operational AI works best when it supports real workflows instead of living in a demo environment. At Nilaya AI, we focus on automation systems that connect tools, people, and decision points so teams can move faster without losing control.</p><p>The strongest outcomes usually come from targeted automation: routing repetitive tasks, summarizing context for reviewers, and surfacing the right next action at the right time.</p>",
        },
        {
            "title": "Designing Document Intelligence for Teams That Need Trust",
            "slug": "designing-document-intelligence-for-trust",
            "excerpt": "Why document AI should optimize for traceability, confidence, and operational clarity, not just extraction speed.",
            "content": "<p>Document intelligence is more than OCR. Teams need to know where information came from, how it was extracted, and what confidence they should place in the result.</p><p>That is why strong document systems combine extraction, validation, search, and human review into one reliable operating loop.</p>",
        },
    ]

    for item in items:
        blog, _ = Blog.objects.get_or_create(
            slug=item["slug"],
            defaults={
                **item,
                "category": "AI Strategy",
                "tags": ["AI", "Automation", "Operations"],
                "author_name": "Nilaya AI Team",
                "author_role": "AI Strategy",
                "status": "published",
                "featured": True,
                "meta_title": item["title"],
                "meta_description": item["excerpt"],
                "canonical_url": f"https://nilaya.ai/blog/{item['slug']}",
                "allow_indexing": True,
                "published_at": timezone.now(),
            },
        )
        blog.title = item["title"]
        blog.excerpt = item["excerpt"]
        blog.content = item["content"]
        blog.category = "AI Strategy"
        blog.tags = ["AI", "Automation", "Operations"]
        blog.author_name = "Nilaya AI Team"
        blog.author_role = "AI Strategy"
        blog.status = "published"
        blog.featured = True
        blog.meta_title = item["title"]
        blog.meta_description = item["excerpt"]
        blog.canonical_url = f"https://nilaya.ai/blog/{item['slug']}"
        blog.allow_indexing = True
        if not blog.published_at:
            blog.published_at = timezone.now()
        blog.save()


def main():
    admin = ensure_admin()
    employee = ensure_employee()
    team_members = seed_team()
    seed_services(team_members)
    seed_gis_services(team_members)
    seed_products()
    seed_projects(admin)
    seed_testimonials()
    seed_blogs()

    print("Seed complete")
    print("Admin login: admin / admin123")
    print("Employee login: employee@nilaya.ai / Employee@123")
    print(f"Employee profile id: {employee.employee_id}")


if __name__ == "__main__":
    main()
