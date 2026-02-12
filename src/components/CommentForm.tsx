import React, { useState } from 'react';
import '@/assets/css/tailwind-conversion.css';
import btnGreetingImg from '../assets/img/btn-greeting.png';
import { toast } from 'sonner';

interface Comment {
  name: string;
  message: string;
  timestamp: string;
}

const CommentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      name: 'ចង់ការ/Jongka Gift Station',
      message: '"ធីម"ចង់ការ Gift Station" សូមគោរពជូនពរដល់គូរស្វាមី ភរិយាថ្មី នូវសុភមង្គលជានិរន្តរ៍… ❤️🙏🏻"',
      timestamp: '22-05-2025 | 11:20pm'
    },
    {
      name: 'P1CHGG',
      message: 'Hi haha happy your wedding day bro sal..sorry can\'t join , I hope we can keep in touch later. Anyway HAPPY WIFE HAPPY LIFE 😍 (check aba pg) from pichais',
      timestamp: '25-05-2025 | 04:34pm'
    },
    {
      name: 'Sun',
      message: 'Congratulations on your wedding Fri. Sorry can\'t join your wedding. Best wishes to the bride and groom as you begin your journey together.',
      timestamp: '25-05-2025 | 06:26pm'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !comment.trim()) {
      toast.error('សូមបំពេញឈ្មោះ និងពាក្យជូនពររបស់អ្នកអោយបានគ្រប់គ្រាន់។');
      return;
    }

    const newComment: Comment = {
      name: name.trim(),
      message: comment.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', ' |')
    };

    setComments(prev => [newComment, ...prev]);
    setName('');
    setComment('');
  };

  return (
    <div className="formbg-outer flex flex-col items-center justify-center">
      <div className="formbg w-full max-w-2xl mx-auto">
        <div className="formbg-inner padding-horizontal--48 flex flex-col items-center justify-center">
          <form onSubmit={handleSubmit} className="space-y-6 w-full flex flex-col items-center justify-center">
            <div className="field padding-bottom--24">
              <input
                placeholder="Name"
                name="yourname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control w-full mb-4 rounded-lg border-0 p-3 bg-wedding-overlay text-wedding-dark-green text-base"
                style={{
                  backgroundColor: 'rgb(75 112 155 / 18%)',
                  border: '0px solid #03491f'
                }}
              />
            </div>
            <div className="field padding-bottom--24">
              <textarea
                placeholder="Comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="form-control w-full mb-4 rounded-lg border-0 p-3 bg-wedding-overlay text-wedding-dark-green text-base resize-none"
                style={{
                  backgroundColor: 'rgb(75 112 155 / 18%)',
                  border: '0px solid #03491f'
                }}
              />
            </div>
            <div className="field padding-bottom--24 text-center">
              <button
                type="submit"
                name="submit"
                className="w-[70%] bg-transparent border-none p-0"
              >
                <img
                  className="zoom-in-out-box w-full"
                  src={btnGreetingImg}
                  alt="Send Greeting"
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div 
        id="parent" 
        className="js-scroll fade-in-bottom flex flex-col items-center justify-center"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'absolute',
          width: '98%',
          textAlign: 'center',
          transform: 'scaleY(-1)',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        {comments.map((comment, index) => (
          <div
            key={index}
            className="cmt slc"
            style={{
              backgroundColor: 'rgb(75 112 155 / 18%)',
              margin: '10px 10px 0 0',
              fontFamily: "'Kh Ang MoulHand', 'Times New Roman', 'Khmer OS Metalchrieng', sans-serif",
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <p
              style={{
                padding: '21px 0px',
                margin: '0px 36px',
                borderBottom: '1px solid',
                fontSize: 'larger',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                color: '#03491f'
              }}
            >
              <i style={{ fontSize: '1.5rem' }}>&#9787;</i> {comment.name}
            </p>
            <span
              style={{
                textAlign: 'center',
                display: 'block',
                padding: '40px 15px 11px',
                fontSize: 'large',
                fontFamily: "'Times New Roman', 'Khmer OS Metalchrieng', sans-serif",
                color: '#03491f'
              }}
            >
              "{comment.message}"<i style={{ fontSize: '1.5rem' }}> &#9754;</i>
            </span>
            <br />
            <span style={{ color: '#03491f' }}>{comment.timestamp}</span>
          </div>
        ))}
      </div>

      <style>{`
        .formbg-outer * {
          color: #03491f;
        }
        
        .formbg-outer .zoom-in-out-box {
          animation: zoom-in-zoom-out 2s ease infinite;
        }

        @keyframes zoom-in-zoom-out {
          0% {
            transform: scale(0.9, 0.9);
          }
          50% {
            transform: scale(1, 1);
          }
          100% {
            transform: scale(0.9, 0.9);
          }
        }

        .formbg-outer ::placeholder {
          font-family: 'Times New Roman', sans-serif;
          color: #03491f;
        }

        .formbg-outer input:focus,
        .formbg-outer textarea:focus {
          outline: none;
          border: none;
        }

        @media only screen and (max-width: 640px) {
          .formbg-outer .cmt {
            font-family: unset;
          }
        }
      `}</style>
    </div>
  );
};

export default CommentForm; 