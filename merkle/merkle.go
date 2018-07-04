package merkle

import (
	"crypto/sha256"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/onrik/gomerkle"
)

// GetLeafNodes for given a dir and store in an array of []byte
func GetLeafNodes(searchDir string) (fileBytes [][]byte, err error) {

	err = filepath.Walk(searchDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("prevent panic by handling failure accessing a path: %q %v\t", searchDir, err)
		}

		if !info.IsDir() {
			data, err := ioutil.ReadFile(path)
			if err != nil {
				return fmt.Errorf("error occured while reading file: %v", err)
			}
			fileBytes = append(fileBytes, data)
		}
		return nil
	})

	return fileBytes, nil
}

//CreateTree is a method for generating a merkle tree for a dataset
func CreateTree(data [][]byte, leafIdx int, leaf []byte) (bool, []byte, error) {
	tree := gomerkle.NewTree(sha256.New())
	tree.AddData(data...)

	err := tree.Generate()
	if err != nil {
		return false, nil, fmt.Errorf("%v", err)
	}

	proof := tree.GetProof(leafIdx)
	fmt.Printf("%s\t%x\n", "merkleRoot", tree.Root())
	root := tree.Root()

	return tree.VerifyProof(proof, tree.Root(), leaf), root, nil
}

//CheckError shut downs the server if there's an error and throws output as stderr
func CheckError(err error) error {

	if err != nil {
		return fmt.Errorf("error occured: %v", err)
	}
	return nil
}
