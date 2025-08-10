# Firebase Storage Rules Configuration

To enable audio file uploads for the video generation system, you need to configure Firebase Storage rules.

## 1. Default Rules (Development)

For development, you can use these permissive rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: These rules allow anyone to read/write to your storage. Only use for development!

## 2. Production Rules

For production, use these secure rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to audio files
    match /audio/{audioFile} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Restrict other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. How to Update Rules

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`foss-mentoring`)
3. Navigate to Storage > Rules
4. Replace the rules with the ones above
5. Click "Publish"

### Option 2: Firebase CLI
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init storage`
4. Edit `storage.rules` file
5. Deploy: `firebase deploy --only storage`

## 4. Testing Rules

After updating rules, test the audio upload:

1. Start your app: `npm run dev`
2. Submit a video generation request
3. Check Firebase Console > Storage for uploaded files
4. Verify the audio URL is accessible

## 5. File Structure

Your storage will have this structure:
```
foss-mentoring.appspot.com/
└── audio/
    ├── tts-audio-1234567890-abc123.mp3
    ├── tts-audio-1234567891-def456.mp3
    └── ...
```

## 6. Security Considerations

- **Public Read**: Audio files are publicly readable (required for Shotstack access)
- **Authenticated Write**: Only authenticated users can upload
- **File Naming**: Unique timestamps prevent conflicts
- **Content Type**: Restricted to audio/mpeg files
- **Cache Control**: 1-hour cache for performance

## 7. Monitoring

- Check Firebase Console > Storage for usage
- Monitor upload/download counts
- Set up alerts for unusual activity
- Review access logs regularly
