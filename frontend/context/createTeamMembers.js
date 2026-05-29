// createTeamMembers.js
const teamMembers = [
    {
        "joinDate": "2023-10-20",
        "name": "Smutika",
        "role": "Sales Development Representative",
        "department": "Sales",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Sales professional driving business growth and client acquisition.",
        "status": "Active",
        "member_type": "employee",
        "education": "B.Tech",
        "skills": ["Sales", "CRM", "Lead Generation"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2025-07-07",
        "name": "Suryanshu",
        "role": "Software Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Software developer creating end-to-end web solutions.",
        "status": "Active",
        "member_type": "employee",
        "education": "B. Tech",
        "skills": ["React", "Spring Boot", "Django", "Python", "Java", "Database Design", "JavaScript", "Devops"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2025-03-12",
        "name": "Pooja",
        "role": "Software Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Software developer focused on building scalable and efficient applications.",
        "status": "Active",
        "member_type": "employee",
        "education": "B. Tech",
        "skills": ["React", "Java", "Database Design"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-09-14",
        "name": "Reshwanth",
        "role": "Full Stack Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Full stack developer creating end-to-end web solutions.",
        "status": "Alumni",
        "member_type": "employee",
        "education": null,
        "skills": ["React", "Node.js", "Cloud Architecture"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2025-07-07",
        "name": "Swagtika",
        "role": "Software Developer Intern",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Software developer creating innovative solutions and contributing to our development team.",
        "status": "Active",
        "member_type": "employee",
        "education": "B. Tech",
        "skills": ["JavaScript", "Python", "Web Development"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-01-02",
        "name": "Ipsit Panda",
        "role": "Co-Founder",
        "department": "",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Technology innovator and strategic partner in building Nilaya AI's future.",
        "status": "Active",
        "member_type": "founder",
        "education": "Master's degree from IIT Delhi",
        "skills": [],
        "achievements": ["AI Research Excellence", "Innovation Pioneer"],
        "experience": "Extensive experience in teaching and academic leadership"
    },
    {
        "joinDate": "2023-08-16",
        "name": "Reeta",
        "role": "ML Engineer",
        "department": "Data Science",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Data scientist specializing in machine learning and analytics.",
        "status": "Active",
        "member_type": "employee",
        "education": null,
        "skills": ["Machine Learning", "TensorFlow", "Analytics"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-02-08",
        "name": "Sagar",
        "role": "Senior UI/UX Designer",
        "department": "Design",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Creative designer crafting beautiful and intuitive user experiences.",
        "status": "Active",
        "member_type": "employee",
        "education": "B.Com from Vikramdev University",
        "skills": ["UI/UX Design", "Prototyping", "User Research"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2023-02-01",
        "name": "Dr. Soumen Halder",
        "role": "Chief Operating Officer",
        "department": "Operations",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Ensuring operational excellence and efficient business processes across all departments.",
        "status": "Active",
        "member_type": "executive",
        "education": "B.Sc. from Jadavpur University, Ph.D. from Tata Institute of Fundamental Research, Mumbai",
        "skills": ["Operations", "Process Optimization", "Analytics"],
        "achievements": [],
        "experience": "Visiting Researcher at KEK, Japan, Researcher at TIFR"
    },
    {
        "joinDate": "2023-10-19",
        "name": "Vibhav",
        "role": "Mobile Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Android developer focused on creating high-performance mobile apps.",
        "status": "Alumni",
        "member_type": "employee",
        "education": null,
        "skills": ["Flutter", "React Native", "iOS"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2023-06-15",
        "name": "Trushank",
        "role": "Full Stack Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Full stack developer building modern web applications with end-to-end expertise.",
        "status": "Active",
        "member_type": "employee",
        "education": "B.Sc. in Computer Science from Model College of Science, Mumbai University",
        "skills": ["React Next.js", "Python Django", "React Native", "Devops", "Tailwind CSS", "Angular", "Wordpress", "PHP", "PostgreSQL"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-06-15",
        "name": "Rasmita Sahoo",
        "role": "Strategic Advisor",
        "department": "Advisory",
        "location": "Remote",
        "image": null,
        "bio": "Strategic advisor providing guidance and industry expertise.",
        "status": "Active",
        "member_type": "employee",
        "education": "Research and Development in Science from University of Hyderabad",
        "skills": ["Strategy", "Advisory", "Industry Expertise"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2023-11-15",
        "name": "Radharani",
        "role": "Backend Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Backend developer building robust and scalable server solutions.",
        "status": "Alumni",
        "member_type": "employee",
        "education": null,
        "skills": ["Node.js", "Database", "API Design"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2024-06-04",
        "name": "Varghese Babu",
        "role": "Business Partner",
        "department": "",
        "location": "Global",
        "image": null,
        "bio": "Physics researcher turned business innovator with global research experience.",
        "status": "Active",
        "member_type": "founder",
        "education": "Master's degree in physics from IIT Madras, Ph.D. in particle physics from TIFR, Mumbai",
        "skills": [],
        "achievements": ["International Research Excellence", "Physics Innovation Award"],
        "experience": "10+ years of collider physics research at international facilities"
    },
    {
        "joinDate": "2021-08-19",
        "name": "Kiran",
        "role": "Software Developer",
        "department": "Engineering",
        "location": "Remote",
        "image": null,
        "bio": "Former software developer who contributed to various projects.",
        "status": "Alumni",
        "member_type": "employee",
        "education": null,
        "skills": [],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-01-02",
        "name": "Ipsit Panda",
        "role": "Chief Technology Officer (CTO)",
        "department": "Technology",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Driving technology direction and product excellence.",
        "status": "Active",
        "member_type": "executive",
        "education": "Master's degree from IIT Delhi",
        "skills": ["AI/ML", "System Architecture", "Team Leadership"],
        "achievements": [],
        "experience": "Extensive experience in teaching and academic leadership"
    },
    {
        "joinDate": "2021-10-22",
        "name": "Souvik",
        "role": "Data Scientist",
        "department": "Data Science",
        "location": "Remote",
        "image": null,
        "bio": "Former data scientist with expertise in machine learning.",
        "status": "Alumni",
        "member_type": "employee",
        "education": null,
        "skills": [],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-01-03",
        "name": "Debansh Das Sharma",
        "role": "Chief HR & Marketing Officer",
        "department": "HR & Marketing",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Leading human resources and marketing strategies for organizational growth and culture.",
        "status": "Active",
        "member_type": "executive",
        "education": "B.Sc. in Chemistry from Sambalpur University, MBA in Marketing from Punjab Technical University",
        "skills": ["HR Strategy", "Marketing", "Culture Building"],
        "achievements": [],
        "experience": "10+ years as Managerial Business Associate at Tata AIA"
    },
    {
        "joinDate": "2023-08-20",
        "name": "Shradha",
        "role": "Full Stack Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Full stack developer with expertise in modern web technologies.",
        "status": "Active",
        "member_type": "employee",
        "education": "Graduation from IGIT Sarang",
        "skills": ["React Next.js", "Python Django", "DevOps", "Tailwind CSS", "Angular", "PostgreSQL"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-01-01",
        "name": "Bibhuprasad Mahakud",
        "role": "Founder",
        "department": "",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Visionary leader driving innovation and strategic growth at Nilaya AI with over 10 years of experience in AI and technology.",
        "status": "Active",
        "member_type": "founder",
        "education": "Master's degree from IIT Delhi, Ph.D. in Physics Data Analysis from TIFR, Mumbai",
        "skills": [],
        "achievements": ["AI Innovation Award", "Tech Leader 2023"],
        "experience": "7+ years at CERN, Geneva, Switzerland"
    },
    {
        "joinDate": "2022-03-15",
        "name": "Ateeb",
        "role": "Senior Android Developer",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Android development specialist building innovative mobile solutions.",
        "status": "Alumni",
        "member_type": "employee",
        "education": "B.Tech in Computer Science from Symbiosis University of Applied Sciences",
        "skills": ["Android", "Kotlin", "Mobile Architecture"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2025-08-28",
        "name": "Ritik",
        "role": "Junior Data Scientist",
        "department": "Data Science",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Data enthusiast analyzing insights professionally.",
        "status": "Active",
        "member_type": "employee",
        "education": null,
        "skills": ["Data Science", "Machine Learning", "python"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2022-01-01",
        "name": "Bibhuprasad Mahakud",
        "role": "Chief Executive Officer (CEO)",
        "department": "Executive",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Visionary leader driving innovation and strategic growth at Nilaya AI.",
        "status": "Active",
        "member_type": "executive",
        "education": "Master's degree from IIT Delhi, Ph.D. in Physics Data Analysis from TIFR, Mumbai",
        "skills": ["Strategic Leadership", "AI Strategy", "Business Development"],
        "achievements": [],
        "experience": "7+ years at CERN, Geneva, Switzerland"
    },
    {
        "joinDate": "2023-07-02",
        "name": "Smruti Dash",
        "role": "Chief Sales Officer (CSO)",
        "department": "Sales",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Driving sales growth and building strong client relationships worldwide.",
        "status": "Active",
        "member_type": "executive",
        "education": "Professional experience in sales and business development",
        "skills": ["Sales Strategy", "Client Relations", "Business Growth"],
        "achievements": [],
        "experience": "Extensive experience in sales leadership and business development"
    },
    {
        "joinDate": "2023-02-01",
        "name": "Soumen Halder",
        "role": "Senior Data Scientist",
        "department": "Data Science",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Data scientist extracting insights from complex datasets.",
        "status": "Active",
        "member_type": "employee",
        "education": "B.Sc. from Jadavpur University, Ph.D. from Tata Institute of Fundamental Research, Mumbai",
        "skills": ["Machine Learning", "Python", "Statistics"],
        "achievements": [],
        "experience": null
    },
    {
        "joinDate": "2025-09-15",
        "name": "Alok",
        "role": "Software Developer Intern",
        "department": "Engineering",
        "location": "Bhubaneswar, India",
        "image": null,
        "bio": "Software developer creating end-to-end web solutions.",
        "status": "Active",
        "member_type": "employee",
        "education": "MCA",
        "skills": ["React", "Java", "Python", "Machine Learning"],
        "achievements": [],
        "experience": null
    }
];

// Configuration - IMPORTANT: Replace with your actual JWT token
const API_URL = process.env.NILAYA_TEAM_IMPORT_API_URL || 'http://127.0.0.1:8000/api/team/';
const JWT_TOKEN = process.env.NILAYA_TEAM_IMPORT_JWT || '';
 
// Function to create a team member using FormData
async function createTeamMember(memberData) {
    try {
        if (!JWT_TOKEN) {
            throw new Error("Set NILAYA_TEAM_IMPORT_JWT before running this import script.");
        }
        // Create FormData object
        const formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(memberData).forEach(key => {
            if (memberData[key] !== null && memberData[key] !== undefined) {
                if (Array.isArray(memberData[key])) {
                    // For arrays, stringify them
                    formData.append(key, JSON.stringify(memberData[key]));
                } else {
                    formData.append(key, memberData[key]);
                }
            }
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${JWT_TOKEN}`
                // Don't set Content-Type - let browser set it with boundary for FormData
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Successfully created: ${memberData.name}`);
            return result;
        } else {
            const errorText = await response.text();
            console.error(`❌ Failed to create ${memberData.name}:`, response.status, response.statusText, errorText);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error creating ${memberData.name}:`, error.message);
        return null;
    }
}

// Function to create all team members
async function createAllTeamMembers() {
    console.log('🚀 Starting to create team members...');
    console.log(`📊 Total members to create: ${teamMembers.length}`);
    
    const results = [];
    
    for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        console.log(`\n📝 Creating ${i + 1}/${teamMembers.length}: ${member.name}`);
        
        const result = await createTeamMember(member);
        results.push({ member: member.name, success: !!result });
        
        // Add delay between requests (1 second) to avoid rate limiting
        if (i < teamMembers.length - 1) {
            console.log('⏳ Waiting 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Summary
    console.log('\n🎉 ===== CREATION SUMMARY =====');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
        console.log('\n📋 Failed members:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.member}`);
        });
    }
    
    console.log('🎊 Process completed!');
    return results;
}

// Run the script
createAllTeamMembers().catch(error => {
    console.error('💥 Script failed:', error);
});
