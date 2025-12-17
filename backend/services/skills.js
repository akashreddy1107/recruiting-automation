
// Comprehensive list of Software Engineering Skills for Resume Parsing
// Categorized for maintenance, but exported as a single flat list or categorized object as needed.

export const SKILL_CATEGORIES = {
    LANGUAGES: [
        'Python', 'JavaScript', 'Java', 'C#', 'C++', 'Go', 'Golang', 'Rust', 'Kotlin', 'Swift', 'TypeScript', 'PHP', 'Ruby', 'Scala', 'Perl', 'Lua', 'R', 'Matlab', 'Assembly', 'Shell', 'Bash', 'Objective-C', 'Dart', 'Elixir', 'Haskell', 'Clojure', 'Groovy', 'F#', 'Erlang', 'VHDL', 'Verilog', 'Solidity', 'Apex'
    ],
    WEB_FRONTEND: [
        'React', 'React.js', 'Angular', 'AngularJS', 'Vue', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'Ember.js', 'Backbone.js', 'jQuery', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Sass', 'Less', 'Tailwind', 'Bootstrap', 'Material UI', 'Chakra UI', 'Redux', 'MobX', 'Webpack', 'Babel', 'Vite', 'Parcel', 'Gulp', 'Grunt', 'D3.js', 'Three.js', 'WebAssembly', 'PWA'
    ],
    WEB_BACKEND: [
        'Node.js', 'Node', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Hibernate', 'Laravel', 'Symfony', 'Rails', 'Ruby on Rails', 'ASP.NET', 'ASP.NET Core', '.NET', 'GraphQL', 'Apollo', 'REST', 'RESTful', 'gRPC', 'Socket.io', 'WebSockets', 'Microservices', 'Serverless'
    ],
    DATABASES: [
        'SQL', 'MySQL', 'PostgreSQL', 'Postgres', 'Oracle', 'SQL Server', 'MSSQL', 'SQLite', 'MariaDB', 'MongoDB', 'NoSQL', 'Redis', 'Cassandra', 'DynamoDB', 'Cosmos DB', 'CouchDB', 'Elasticsearch', 'Solr', 'Neo4j', 'InfluxDB', 'Firebase', 'Firestore', 'Realm', 'Supabase'
    ],
    CLOUD_DEVOPS: [
        'AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'GitLab CI', 'Travis CI', 'GitHub Actions', 'Vagrant', 'Puppet', 'Chef', 'Prometheus', 'Grafana', 'ELK Stack', 'Splunk', 'New Relic', 'Datadog', 'Nginx', 'Apache', 'Heroku', 'DigitalOcean', 'Linode', 'Vercel', 'Netlify', 'OpenStack', 'CloudFormation', 'Lambda', 'EC2', 'S3', 'ECS', 'EKS'
    ],
    MOBILE: [
        'React Native', 'Flutter', 'Ionic', 'Cordova', 'Xamarin', 'Android', 'iOS', 'SwiftUI', 'UIKit', 'Jetpack Compose', 'Expo', 'Unity', 'Unreal Engine'
    ],
    AI_ML_DATA: [
        'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'OpenCV', 'Hadoop', 'Spark', 'Kafka', 'Airflow', 'Tableau', 'Power BI', 'BigQuery', 'Snowflake', 'Redshift', 'Databricks', 'LLM', 'Generative AI', 'GPT', 'LangChain', 'Hugging Face', 'MLOps'
    ],
    TOOLS_METHODS: [
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Trello', 'Asana', 'Notion', 'Slack', 'Teams', 'Zoom', 'Agile', 'Scrum', 'Kanban', 'Waterfall', 'TDD', 'BDD', 'CI/CD', 'DevOps', 'OOP', 'Functional Programming', 'Design Patterns', 'System Design', 'UML', 'Linux', 'Unix', 'Windows', 'MacOS'
    ]
};

// Flattened list for easy searching
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// Regulatory/Visa keywords (kept separate)
export const VISA_KEYWORDS = ['H1B', 'Green Card', 'Citizen', 'Visa', 'Sponsorship', 'EAD', 'OPT', 'CPT', 'TN Visa', 'Permanent Resident'];
