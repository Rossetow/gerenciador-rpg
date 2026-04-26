package supabase

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const bucket = "personagens-imagens"

func UploadImagem(personagemID string, file io.Reader, contentType string) (string, error) {
	endpoint := os.Getenv("SUPABASE_S3_ENDPOINT")
	accessKey := os.Getenv("SUPABASE_S3_ACCESS_KEY")
	secretKey := os.Getenv("SUPABASE_S3_SECRET_KEY")
	bucket := os.Getenv("SUPABASE_BUCKET")

	if endpoint == "" || accessKey == "" || secretKey == "" || bucket == "" {
		return "", fmt.Errorf("S3 env vars must be set")
	}

	ext := extensionFromContentType(contentType)
	key := personagemID + ext

	// Load config
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"), // Supabase usa região fake
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return "", fmt.Errorf("failed to load aws config: %w", err)
	}

	// Create S3 client com endpoint customizado
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true // IMPORTANTE pro Supabase
	})

	// Upload
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload: %w", err)
	}

	// URL pública (igual antes)
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s",
		os.Getenv("SUPABASE_URL"),
		bucket,
		key,
	)

	return publicURL, nil
}

func extensionFromContentType(ct string) string {
	switch ct {
	case "image/jpeg":
		return ".jpg"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	default:
		return ".png"
	}
}
