# Certificate Generator

A production-ready certificate generator for online course platforms built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Fabric.js. Features include secure certificate generation, PDF export, and multiple security measures.

## Features

### 🎓 Certificate Generation
- **Professional Templates**: 4 built-in professional certificate templates with customizable colors and layouts
- **Dynamic Content**: Automatically populated student information, course details, and completion data
- **Real-time Preview**: Live preview of certificate changes with responsive design
- **Multiple Export Options**: PDF download with high-quality rendering

### 🔒 Security Features
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Verification Hash**: Cryptographic hash for certificate authenticity
- **Unique IDs**: Secure certificate and credential ID generation
- **PDF Watermarks**: Security watermarks embedded in PDF exports
- **Data Validation**: Comprehensive validation of certificate data integrity

### 🎨 Design & UX
- **Responsive Design**: Fully responsive interface that works on all devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Intuitive Forms**: Step-by-step form interface with validation feedback
- **Template Selection**: Easy template switching with live preview
- **Professional Typography**: Carefully chosen fonts and spacing

### 🛠 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Next.js 14**: Latest Next.js with App Router
- **Server-Side Safe**: No server-side dependencies for certificate generation
- **Memory Efficient**: Optimized rendering and resource management
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Canvas**: Fabric.js for advanced certificate design
- **PDF Generation**: jsPDF with html2canvas for high-quality exports
- **Icons**: Lucide React icons
- **State Management**: Custom React hooks with localStorage persistence

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── CertificateCanvas.tsx # Fabric.js certificate editor
│   ├── CertificatePreview.tsx # Certificate preview component
│   └── CertificateGenerator.tsx # Main generator component
├── data/                    # Mock data and utilities
│   └── mockData.ts         # Sample data and validation
├── hooks/                   # Custom React hooks
│   └── useCertificate.ts   # Certificate state management
├── types/                   # TypeScript type definitions
│   └── certificate.ts      # Certificate-related types
└── utils/                   # Utility functions
    ├── security.ts          # Security and validation utilities
    └── pdfGenerator.ts      # PDF generation utilities
```

## Usage Guide

### 1. Basic Certificate Generation

1. **Fill Student Information**:
   - Enter student's full name
   - Provide student email address
   - Set completion date

2. **Configure Course Details**:
   - Select from predefined courses or enter custom course title
   - Specify instructor name
   - Set course duration and level
   - Add authorized signatory information

3. **Choose Design**:
   - Select from 4 professional templates
   - Preview changes in real-time

4. **Generate Certificate**:
   - Preview PDF before download
   - Download high-quality PDF certificate

### 2. Security Features

The application includes multiple security layers:

- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents excessive certificate generation
- **Verification System**: Each certificate includes unique verification codes
- **PDF Security**: Watermarks and metadata for authenticity

### 3. Customization

#### Adding New Templates

1. Create a new template object in `src/data/mockData.ts`:

```typescript
const newTemplate: CertificateTemplate = {
  id: 'custom',
  name: 'Custom Design',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  titleColor: '#333333',
  textColor: '#666666',
  backgroundPattern: 'custom'
};
```

2. Add it to the `mockTemplates` array.

#### Modifying Certificate Layout

Edit the `CertificatePreview.tsx` component to customize:
- Text positioning and styling
- Layout structure
- Additional elements
- Security features placement

## Security Considerations

### Production Deployment

1. **Content Security Policy**: The application includes CSP headers for security
2. **Rate Limiting**: Implement server-side rate limiting in production
3. **Input Validation**: All inputs are sanitized but consider additional server-side validation
4. **HTTPS**: Always serve over HTTPS in production
5. **Monitoring**: Implement logging for certificate generation activities

### Known Security Features

- XSS protection through input sanitization
- Rate limiting to prevent abuse
- Secure random ID generation
- PDF security features (watermarks, metadata)

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Requirements:
- HTML5 Canvas support
- Modern JavaScript (ES2020+)
- PDF blob generation support

## Performance

### Optimizations Included

- Lazy loading of Fabric.js components
- Efficient re-rendering with React.memo
- Optimized PDF generation with quality settings
- Memory cleanup for canvas elements
- Debounced input handling

### Performance Tips

1. **Template Switching**: Templates are cached for faster switching
2. **PDF Quality**: Adjust quality settings based on needs
3. **Memory Management**: Canvas elements are properly disposed
4. **Image Assets**: Optimize any custom images added to templates

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**:
   - Check browser compatibility
   - Ensure sufficient memory
   - Verify element exists before generation

2. **Template Not Loading**:
   - Check template ID exists in mockData
   - Verify template structure matches interface

3. **Security Validation Errors**:
   - Ensure all required fields are filled
   - Check for suspicious content in inputs
   - Verify date formats are correct

### Debug Mode

Set `NODE_ENV=development` for additional logging:
- Certificate validation details
- PDF generation progress
- Security check results

## License

MIT License - see LICENSE file for details.

## Support

For issues and support:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are up to date
4. Create an issue with detailed reproduction steps

---

Built with ❤️ for online education platforms.
