'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AudioRecorderProps {
  onAudioSaved: (audioUrl: string) => void;
}

const AudioRecorder = ({ onAudioSaved }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize the audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
        audioRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Update waveform during recording
  const updateWaveform = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Reduce the data to a manageable size for display
      const reducedData: number[] = [];
      const bucketSize = Math.floor(dataArray.length / 30);
      
      for (let i = 0; i < 30; i++) {
        let sum = 0;
        for (let j = 0; j < bucketSize; j++) {
          sum += dataArray[i * bucketSize + j] / 255;
        }
        reducedData.push(sum / bucketSize);
      }
      
      setWaveformData(reducedData);
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      mediaStreamSource.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioChunksRef.current = [];
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Upload the audio recording
        uploadAudioRecording(audioBlob);
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start visualizing the waveform
      animationRef.current = requestAnimationFrame(updateWaveform);
      
      // Start a timer to track recording duration
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      // Store the interval ID to clear it later
      mediaRecorder.addEventListener('stop', () => {
        clearInterval(timerInterval);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const discardRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setAudioURL(null);
    setIsPlaying(false);
    setWaveformData([]);
  };
  
  const uploadAudioRecording = async (audioBlob: Blob) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload audio recording');
      }
      
      const data = await response.json();
      
      if (data.audioUrl) {
        onAudioSaved(data.audioUrl);
      }
      
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Audio Recording</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Waveform visualization */}
        {(isRecording || audioURL) && (
          <div className="h-16 my-3 bg-secondary/20 rounded-md p-2">
            <div className="h-full flex items-center justify-between">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="bg-primary w-1.5 mx-px"
                  style={{ height: `${Math.max(5, value * 100)}%` }}
                />
              ))}
              {!isRecording && !waveformData.length && audioURL && (
                <Progress value={undefined} className="w-full" />
              )}
            </div>
          </div>
        )}
        
        {/* Recording time or playback controls */}
        {isRecording ? (
          <p className="text-center text-destructive font-bold">
            Recording: {formatTime(recordingTime)}
          </p>
        ) : audioURL ? (
          <div className="flex justify-center mt-2 space-x-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={discardRecording}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        
        {/* Main recording button */}
        {!audioURL ? (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className="w-full mt-2"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        ) : null}
        
        {isUploading && <p className="mt-2 text-sm">Uploading audio recording...</p>}
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;