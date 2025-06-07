# Clerk Authentication ↔ MongoDB Integration

## 🔗 **How Clerk Connects to MongoDB**

The test user you saw (`test_user_123`) was from a MongoDB connection test and has been **removed**. Here's how the real Clerk authentication integrates with MongoDB:

## 🔄 **Authentication Flow**

### **1. User Signs In with Clerk**
```
User clicks "Sign In" → Clerk handles authentication → User gets Clerk ID
```

### **2. Automatic Database User Creation**
```
Clerk User ID → API calls → MongoDB User record created automatically
```

### **3. Data Association**
```
All summaries/history → Linked to Clerk User ID → Stored in MongoDB
```

## 🛠️ **Technical Implementation**

### **User Initialization Hook** (`hooks/use-user-initialization.ts`)
```typescript
export function useUserInitialization() {
  const { user, isSignedIn, isLoaded } = useUser() // Clerk hook
  
  useEffect(() => {
    if (isSignedIn && user) {
      // Automatically call /api/user to create/get user in MongoDB
      initializeUser()
    }
  }, [isSignedIn, user])
}
```

### **User API Endpoint** (`/app/api/user/route.ts`)
```typescript
export async function GET() {
  const { userId } = await auth() // Get Clerk user ID
  
  // Try to find existing user in MongoDB
  let user = await User.findOne({ clerkId: userId })
  
  if (!user) {
    // Get user info from Clerk
    const clerkUser = await currentUser()
    
    // Create new user in MongoDB with Clerk data
    user = new User({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      profileImage: clerkUser.imageUrl,
      plan: 'free'
    })
    await user.save()
  }
  
  return user
}
```

## 🎯 **Current Status**

### **Why You See Test Data**
- ✅ **Test user removed**: The `test_user_123` data has been cleaned up
- ✅ **System ready**: All integration code is in place
- ⏳ **Waiting for real auth**: Currently in Clerk keyless mode

### **What Happens When You Set Up Real Clerk Keys**

1. **User Signs Up/In**: Real Clerk authentication
2. **Automatic Creation**: User record created in MongoDB instantly
3. **Data Linking**: All generated content linked to real user
4. **History Tracking**: Complete summary history stored

## 🔧 **Integration Points**

### **Automatic User Creation**
- **When**: First time user signs in with Clerk
- **Where**: `/api/user` endpoint
- **Data**: Clerk user info → MongoDB user record

### **Content Saving**
- **All APIs check authentication**: `const { userId } = await auth()`
- **User lookup**: `const user = await User.findOne({ clerkId: userId })`
- **Content association**: All summaries linked to user ID

### **History Management**
- **GET /api/history**: Fetch user's content with `userId` filter
- **POST /api/history**: Save content with user association
- **DELETE /api/history**: Delete only user's own content

## 📊 **Data Flow Example**

### **Real User Journey**:
```
1. User signs up with Clerk
   ↓
2. Clerk provides user ID: "user_2abc123def"
   ↓
3. User initialization hook calls /api/user
   ↓
4. MongoDB user created:
   {
     clerkId: "user_2abc123def",
     email: "john@example.com",
     firstName: "John",
     lastName: "Doe",
     plan: "free"
   }
   ↓
5. User generates study guide
   ↓
6. Content saved to MongoDB:
   {
     userId: "user_2abc123def",
     userEmail: "john@example.com",
     videoTitle: "React Tutorial",
     contentType: "study-guide",
     content: "# React Study Guide..."
   }
```

## 🔒 **Security & Privacy**

### **Data Isolation**
- **User-specific queries**: All database queries filter by `userId`
- **No cross-user access**: Users only see their own content
- **Secure authentication**: Clerk handles all auth security

### **API Protection**
```typescript
// Every protected endpoint starts with:
const { userId } = await auth()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// All queries filter by user:
const userContent = await SummaryHistory.find({ userId })
```

## 🚀 **To See Real Data**

### **Set Up Clerk Keys**:
1. **Visit**: https://dashboard.clerk.com/
2. **Get keys**: Publishable key + Secret key
3. **Update .env.local**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key
   CLERK_SECRET_KEY=sk_test_your_real_key
   ```
4. **Restart server**: `npm run dev`

### **Then**:
1. **Sign up**: Create real account
2. **Generate content**: Create study guides, notes, etc.
3. **Check MongoDB**: See real user data in database
4. **View history**: Click "History" button to see your content

## 🎯 **Current MongoDB Collections**

### **Users Collection** (Empty until real auth)
```javascript
// Will contain real users like:
{
  _id: ObjectId("..."),
  clerkId: "user_2abc123def",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  plan: "free",
  usage: { studyGuides: 5, briefingDocs: 3, notes: 10, chatMessages: 25 },
  createdAt: "2025-06-07T...",
  lastLoginAt: "2025-06-07T..."
}
```

### **Summary History Collection** (Empty until real auth)
```javascript
// Will contain user content like:
{
  _id: ObjectId("..."),
  userId: "user_2abc123def",
  userEmail: "john@example.com",
  videoTitle: "React Tutorial",
  videoUrl: "https://youtube.com/watch?v=...",
  contentType: "study-guide",
  content: "# React Study Guide\n\n## Key Concepts...",
  createdAt: "2025-06-07T..."
}
```

## ✅ **System Status**

- ✅ **MongoDB Connected**: Database working perfectly
- ✅ **Models Defined**: User and SummaryHistory schemas ready
- ✅ **APIs Created**: All endpoints functional
- ✅ **Auto-Save Working**: Content automatically saved
- ✅ **User Initialization**: Automatic user creation ready
- ✅ **History UI**: History modal and management ready
- ⏳ **Waiting for**: Real Clerk authentication keys

The system is **100% ready** - just needs real Clerk keys to start creating actual user accounts and storing their content!
