package supabase

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
)

const bucket = "personagens-imagens"

// UploadImagem uploads a character image to Supabase Storage and returns the public URL.
// personagemID is used as the filename (with content-type-derived extension).
// The bucket must be created as public in the Supabase dashboard.
func UploadImagem(personagemID string, file io.Reader, contentType string) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("SUPABASE_URL and SUPABASE_KEY must be set")
	}

	ext := extensionFromContentType(contentType)
	filename := personagemID + ext

	body, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	uploadURL := supabaseURL + "/storage/v1/object/" + path.Join(bucket, filename)

	req, err := http.NewRequest(http.MethodPost, uploadURL, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", contentType)
	// upsert=true replaces an existing image for the same character
	req.Header.Set("x-upsert", "true")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("supabase upload failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("supabase upload error %d: %s", resp.StatusCode, string(respBody))
	}

	publicURL := supabaseURL + "/storage/v1/object/public/" + path.Join(bucket, filename)
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
