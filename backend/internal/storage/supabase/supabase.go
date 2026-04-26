package supabase

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
)

const bucket = "personagens-imagens"

func UploadImagem(personagemID string, file io.Reader, contentType string) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	log.Printf("[supabase] upload start: personagemID=%s contentType=%s", personagemID, contentType)
	log.Printf("[supabase] SUPABASE_URL=%q (set=%v)", supabaseURL, supabaseURL != "")
	log.Printf("[supabase] SUPABASE_KEY set=%v", supabaseKey != "")

	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("SUPABASE_URL and SUPABASE_KEY must be set")
	}

	ext := extensionFromContentType(contentType)
	filename := personagemID + ext

	body, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	log.Printf("[supabase] file read: %d bytes, filename=%s", len(body), filename)

	uploadURL := supabaseURL + "/storage/v1/object/" + path.Join(bucket, filename)
	log.Printf("[supabase] uploading to: %s", uploadURL)

	req, err := http.NewRequest(http.MethodPost, uploadURL, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("[supabase] HTTP error: %v", err)
		return "", fmt.Errorf("supabase upload failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("[supabase] response: status=%d body=%s", resp.StatusCode, string(respBody))

	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("supabase upload error %d: %s", resp.StatusCode, string(respBody))
	}

	publicURL := supabaseURL + "/storage/v1/object/public/" + path.Join(bucket, filename)
	log.Printf("[supabase] upload success: publicURL=%s", publicURL)
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
