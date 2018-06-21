package merkle

import (
	"crypto/sha256"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/onrik/gomerkle"
	// "github.com/onrik/gomerkle"
)

// func main() {

// 	data, err := GetLeafNodes("/home/thanos/Desktop/merkle-tree")
// 	CheckError(err)

// 	isValid, err := CreateTree(data, 4)

// 	CheckError(err)
// 	fmt.Printf("%v\n", isValid)
// }

// GetLeafNodes for given a dir and store in an array of []byte
func GetLeafNodes(searchDir string) (fileBytes [][]byte, err error) {

	err = filepath.Walk(searchDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", searchDir, err)
			return err
		}
		//if info.IsDir() && info.Name() == subDirToSkip {
		//	fmt.Printf("skipping a dir without errors: %+v \n", info.Name())
		//	return filepath.SkipDir
		//}
		if !info.IsDir() {
			data, err := ioutil.ReadFile(path)
			if err != nil {
				return fmt.Errorf("error Occured: %v", err)
			}
			fileBytes = append(fileBytes, data)
		}
		return nil
	})

	return fileBytes, nil
}

//CreateTree is a method for generating a merkle tree for a dataset
func CreateTree(data [][]byte, leafIdx int, leaf []byte) (bool, error) {
	tree := gomerkle.NewTree(sha256.New())
	tree.AddData(data...)

	err := tree.Generate()
	if err != nil {
		panic(err)
	}

	proof := tree.GetProof(leafIdx)
	// leaf := tree.GetLeaf(validateNode)
	fmt.Printf("%x", leaf)

	return tree.VerifyProof(proof, tree.Root(), leaf), nil
}

//CheckError shut downs the server if there's an error and throws output as stderr
func CheckError(err error) {

	if err != nil {
		panic(err)
	}
}
